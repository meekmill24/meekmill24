import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

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
