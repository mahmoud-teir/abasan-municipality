import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetPasswordEmail = async ({
    email,
    url,
}: {
    email: string;
    url: string;
}) => {
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is missing');
        return { error: 'Email service not configured' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Abasan Municipality <onboarding@resend.dev>',
            to: [email],
            subject: 'Reset Your Password - Abasan Municipality',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Reset Your Password</h2>
                    <p>You requested a password reset for your Abasan Municipality account.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="${url}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">
                        Reset Password
                    </a>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <p style="font-size: 12px; color: #666; margin-top: 24px;">
                        Abasan Alkabera Municipality
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            return { error: error.message };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Email sending failed:', err);
        return { error: 'Failed to send email' };
    }
};
