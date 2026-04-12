import { sendEmail } from '@/lib/resend';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { to, subject, html, from } = await req.json();

        if (!to || !subject || !html) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await sendEmail({ to, subject, html, from });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error('API SendEmail Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
