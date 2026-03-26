import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Profile } from '@/lib/types';
import { buildUserRiskSummary, shouldBlockWithdrawal } from '@/lib/risk/user';

function isMissingRelationError(error: unknown, relation: string) {
    const message =
        error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string'
                ? (error as { message: string }).message
                : String(error || '');
    return message.includes(relation) || message.includes(`relation "${relation}" does not exist`);
}

function isMissingColumnError(error: unknown, column: string) {
    const message =
        error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string'
                ? (error as { message: string }).message
                : String(error || '');
    return message.includes(column) || message.includes(`column "${column}" does not exist`);
}

function isMissingWithdrawalFunctionError(error: unknown) {
    const message =
        error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string'
                ? (error as { message: string }).message
                : String(error || '');
    return message.includes('Could not find the function public.request_withdrawal');
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const amount = Number(body.amount);
        const walletAddress = String(body.walletAddress || '').trim();
        const network = String(body.network || '').trim();
        const withdrawalPin = String(body.withdrawalPin || '').trim();

        if (!Number.isFinite(amount) || amount <= 0) {
            return NextResponse.json({ error: 'A valid withdrawal amount is required' }, { status: 400 });
        }

        if (!walletAddress) {
            return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
        }

        if (!network) {
            return NextResponse.json({ error: 'network is required' }, { status: 400 });
        }

        const profileResult = await adminClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        const { data: profile, error: profileError } = profileResult;

        if (profileError || !profile) {
            throw profileError || new Error('Profile not found');
        }

        const preferredCaseId =
            typeof profile.risk_case_id === 'string' && profile.risk_case_id.trim().length > 0
                ? profile.risk_case_id
                : null;

        const [preferredCaseResult, latestCaseResult, caseCountResult] = await Promise.all([
            preferredCaseId
                ? adminClient
                    .from('risk_cases')
                    .select('id, status, priority, summary, title, recommended_action')
                    .eq('id', preferredCaseId)
                    .eq('user_id', user.id)
                    .in('status', ['open', 'investigating', 'escalated'])
                    .maybeSingle()
                : Promise.resolve({ data: null, error: null }),
            adminClient
                .from('risk_cases')
                .select('id, status, priority, summary, title, recommended_action')
                .eq('user_id', user.id)
                .in('status', ['open', 'investigating', 'escalated'])
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle(),
            adminClient
                .from('risk_cases')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .in('status', ['open', 'investigating', 'escalated']),
        ]);

        let openCase = preferredCaseResult.data || latestCaseResult.data;
        let openCaseCount = caseCountResult.count || 0;
        const preferredCaseError = preferredCaseResult.error;
        const latestCaseError = latestCaseResult.error;
        const caseCountError = caseCountResult.error;

        if (preferredCaseError && !isMissingRelationError(preferredCaseError, 'risk_cases')) {
            throw preferredCaseError;
        }

        if (latestCaseError && !isMissingRelationError(latestCaseError, 'risk_cases')) {
            throw latestCaseError;
        }

        if (caseCountError && !isMissingRelationError(caseCountError, 'risk_cases')) {
            throw caseCountError;
        }

        if (
            (preferredCaseError && isMissingRelationError(preferredCaseError, 'risk_cases')) ||
            (latestCaseError && isMissingRelationError(latestCaseError, 'risk_cases'))
        ) {
            openCase = null;
        }

        if (caseCountError && isMissingRelationError(caseCountError, 'risk_cases')) {
            openCaseCount = 0;
        }

        const typedProfile = profile as Profile;
        if (typedProfile.withdrawal_password && withdrawalPin !== typedProfile.withdrawal_password) {
            return NextResponse.json({ error: 'Invalid Withdrawal PIN' }, { status: 400 });
        }

        const riskSummary = buildUserRiskSummary(typedProfile, openCase, openCaseCount || 0);
        if (shouldBlockWithdrawal(riskSummary)) {
            return NextResponse.json(
                {
                    error: 'Withdrawal temporarily held for security review',
                    riskSummary,
                },
                { status: 409 }
            );
        }

        const { data, error } = await supabase.rpc('request_withdrawal', {
            p_amount: amount,
            p_wallet_address: walletAddress,
            p_network: network,
            p_description: `Withdrawal to ${network}`,
        });

        if (error && !isMissingWithdrawalFunctionError(error)) {
            throw error;
        }

        if (data && !data.success) {
            return NextResponse.json(
                {
                    error: data.message || 'Withdrawal request rejected',
                    riskSummary,
                },
                { status: data.risk_hold ? 409 : 400 }
            );
        }

        if (error && isMissingWithdrawalFunctionError(error)) {
            const nextBalance = Number(typedProfile.wallet_balance || 0) - amount;

            const { error: balanceError } = await adminClient
                .from('profiles')
                .update({ wallet_balance: nextBalance })
                .eq('id', user.id);

            if (balanceError) {
                throw balanceError;
            }

            const baseTransaction = {
                user_id: user.id,
                type: 'withdrawal',
                amount,
                status: 'pending',
                description: `Withdrawal to ${network}`,
            };

            let insertResult = await adminClient
                .from('transactions')
                .insert({
                    ...baseTransaction,
                    wallet_address: walletAddress,
                    network,
                })
                .select()
                .single();

            if (
                insertResult.error &&
                (isMissingColumnError(insertResult.error, 'wallet_address') ||
                    isMissingColumnError(insertResult.error, 'network'))
            ) {
                insertResult = await adminClient
                    .from('transactions')
                    .insert(baseTransaction)
                    .select()
                    .single();
            }

            if (insertResult.error) {
                await adminClient
                    .from('profiles')
                    .update({ wallet_balance: typedProfile.wallet_balance })
                    .eq('id', user.id);
                throw insertResult.error;
            }

            return NextResponse.json({
                success: true,
                riskSummary,
                withdrawal: {
                    success: true,
                    message: 'Withdrawal logic initialized',
                    compatibility_mode: true,
                    transaction: insertResult.data,
                },
            });
        }

        return NextResponse.json({
            success: true,
            riskSummary,
            withdrawal: data,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to initiate withdrawal' },
            { status: 500 }
        );
    }
}
