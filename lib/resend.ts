import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendEmail = async ({
  to,
  subject,
  html,
  from = 'Captiv8 <noreply@resend.dev>'
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) => {
  try {
    if (!resend) {
      console.error('Resend not initialized: Missing RESEND_API_KEY');
      return { error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: from || 'Captiv8 <noreply@captiv8s.com>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error('SendEmail unexpected error:', err);
    return { error: err };
  }
};
