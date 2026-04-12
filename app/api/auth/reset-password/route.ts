import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Generate reset link
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: { redirectTo: `${new URL(req.url).origin}/auth/reset-password` }
        });

        if (linkError) throw linkError;

        if (linkData?.properties?.action_link) {
            await sendEmail({
                to: email,
                subject: 'Reset Your Captiv8 Password',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #0a0a0b; color: white; border-radius: 24px; border: 1px solid #333 text-align: center;">
                        <h1 style="color: #f43f5e; font-size: 24px; text-transform: uppercase; letter-spacing: 4px; font-style: italic;">Security Protocol</h1>
                        <p style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Password Recovery Initialization</p>
                        <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;" />
                        <p style="font-size: 14px; text-align: left; color: #ccc;">A request was made to override your Captiv8 access credentials. If this was you, please follow the link below to set a new passport:</p>
                        <div style="margin: 40px 0;">
                            <a href="${linkData.properties.action_link}" style="background: #f43f5e; color: white; padding: 18px 36px; text-decoration: none; border-radius: 16px; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">Reset Password</a>
                        </div>
                        <p style="font-size: 12px; color: #555;">This link is valid for 1 hour. If you did not request this reset, your account is still secure; no further action is required.</p>
                        <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;" />
                        <p style="font-size: 9px; color: #444; text-transform: uppercase; letter-spacing: 1px;">Captiv8 Secure Node Governance</p>
                    </div>
                `
            });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Password Reset Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
