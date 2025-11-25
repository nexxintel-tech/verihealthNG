import { getUncachableResendClient } from './resend';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(template: EmailTemplate): Promise<void> {
  const { client, fromEmail } = await getUncachableResendClient();
  
  try {
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: template.to,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);
  } catch (error: any) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

export function generateConfirmationEmail(email: string, confirmationUrl: string): EmailTemplate {
  return {
    to: email,
    subject: 'Confirm your VeriHealth account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #111827;">VeriHealth</h1>
                      <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Clinical Remote Monitoring</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #111827;">Confirm your email address</h2>
                      <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #374151;">
                        Thank you for signing up for VeriHealth. Please confirm your email address by clicking the button below:
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 0 0 24px;">
                            <a href="${confirmationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                              Confirm Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 20px; color: #6b7280;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="margin: 0; font-size: 13px; line-height: 18px; color: #3b82f6; word-break: break-all;">
                        ${confirmationUrl}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0; font-size: 12px; line-height: 18px; color: #6b7280; text-align: center;">
                        This email was sent to ${email}. If you didn't create a VeriHealth account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  };
}

export function generatePasswordResetEmail(email: string, resetUrl: string): EmailTemplate {
  return {
    to: email,
    subject: 'Reset your VeriHealth password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #111827;">VeriHealth</h1>
                      <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Clinical Remote Monitoring</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #111827;">Reset your password</h2>
                      <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #374151;">
                        We received a request to reset your VeriHealth password. Click the button below to create a new password:
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 0 0 24px;">
                            <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 16px; font-size: 14px; line-height: 20px; color: #6b7280;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="margin: 0 0 24px; font-size: 13px; line-height: 18px; color: #3b82f6; word-break: break-all;">
                        ${resetUrl}
                      </p>
                      
                      <p style="margin: 0; font-size: 14px; line-height: 20px; color: #ef4444; background-color: #fef2f2; padding: 12px; border-radius: 6px; border-left: 3px solid #ef4444;">
                        <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0; font-size: 12px; line-height: 18px; color: #6b7280; text-align: center;">
                        This email was sent to ${email}. If you didn't request a password reset, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  };
}
