import { z } from "zod";

// Email Template Schema for White-Label Customization
export const emailTemplateSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  templateType: z.enum([
    "welcome",
    "tournament_registration",
    "team_approval",
    "payment_confirmation", 
    "bracket_update",
    "tournament_reminder",
    "results_notification",
    "merchandise_order",
    "custom"
  ]),
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Email subject is required"),
  htmlContent: z.string().min(1, "HTML content is required"),
  textContent: z.string().optional(),
  variables: z.array(z.object({
    key: z.string(),
    description: z.string(),
    required: z.boolean().default(false)
  })).default([]),
  isActive: z.boolean().default(true),
  customBranding: z.object({
    logoUrl: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    companyName: z.string().optional(),
    footerText: z.string().optional()
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type EmailTemplate = z.infer<typeof emailTemplateSchema>;

// Default Email Templates for White-Label Organizations
export const DEFAULT_EMAIL_TEMPLATES = {
  tournament_registration: {
    name: "Tournament Registration Confirmation",
    subject: "Welcome to {{tournament_name}} - Registration Confirmed!",
    htmlContent: createRegistrationTemplate(),
    variables: [
      { key: "participant_name", description: "Name of the participant", required: true },
      { key: "tournament_name", description: "Name of the tournament", required: true },
      { key: "tournament_date", description: "Tournament date", required: true },
      { key: "tournament_location", description: "Tournament location", required: true },
      { key: "registration_id", description: "Unique registration ID", required: true },
      { key: "team_name", description: "Team name (if applicable)", required: false },
      { key: "tournament_dashboard_url", description: "Link to tournament dashboard", required: true },
      { key: "company_name", description: "Organization name", required: true },
      { key: "contact_email", description: "Contact email", required: true },
      { key: "website_url", description: "Website URL", required: true },
      { key: "footer_text", description: "Footer text", required: false },
      { key: "logo_url", description: "Company logo URL", required: false }
    ]
  },
  
  payment_confirmation: {
    name: "Payment Confirmation",
    subject: "Payment Received - {{tournament_name}}",
    htmlContent: createPaymentTemplate(),
    variables: [
      { key: "participant_name", description: "Name of the participant", required: true },
      { key: "tournament_name", description: "Name of the tournament", required: true },
      { key: "amount_paid", description: "Payment amount", required: true },
      { key: "payment_method", description: "Payment method used", required: true },
      { key: "transaction_id", description: "Transaction ID", required: true },
      { key: "payment_date", description: "Payment date", required: true },
      { key: "company_name", description: "Organization name", required: true },
      { key: "contact_email", description: "Contact email", required: true },
      { key: "website_url", description: "Website URL", required: true },
      { key: "footer_text", description: "Footer text", required: false },
      { key: "logo_url", description: "Company logo URL", required: false }
    ]
  }
};

function createRegistrationTemplate(): string {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmation</title>
    <style>
        .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: var(--primary-color, #3b82f6); color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #ffffff; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        .button { background: var(--primary-color, #3b82f6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .tournament-details { background: #f8f9fa; border-left: 4px solid var(--primary-color, #3b82f6); padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            {{#logo_url}}<img src="{{logo_url}}" alt="{{company_name}}" style="max-height: 60px; margin-bottom: 10px;"><br>{{/logo_url}}
            <h1 style="margin: 0;">{{company_name}}</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Tournament Registration</p>
        </div>
        <div class="content">
            <h2 style="color: var(--primary-color, #3b82f6); margin-top: 0;">Registration Confirmed!</h2>
            <p>Hi {{participant_name}},</p>
            <p>Welcome to <strong>{{tournament_name}}</strong>! Your registration has been successfully confirmed.</p>
            <div class="tournament-details">
                <h3 style="margin-top: 0; color: var(--primary-color, #3b82f6);">Tournament Details</h3>
                <p><strong>Tournament:</strong> {{tournament_name}}</p>
                <p><strong>Date:</strong> {{tournament_date}}</p>
                <p><strong>Location:</strong> {{tournament_location}}</p>
                <p><strong>Registration ID:</strong> {{registration_id}}</p>
                {{#team_name}}<p><strong>Team:</strong> {{team_name}}</p>{{/team_name}}
            </div>
            <p>Next steps:</p>
            <ul>
                <li>Check your email for tournament updates</li>
                <li>Review tournament rules and schedule</li>
                <li>Prepare for an amazing competition!</li>
            </ul>
            <a href="{{tournament_dashboard_url}}" class="button">View Tournament Dashboard</a>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Good luck!</p>
        </div>
        <div class="footer">
            <p>{{footer_text}}</p>
            <p>{{company_name}} | {{contact_email}} | {{website_url}}</p>
        </div>
    </div>
</body>
</html>`;
}

function createPaymentTemplate(): string {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
    <style>
        .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: var(--primary-color, #10b981); color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #ffffff; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        .payment-details { background: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 6px; padding: 20px; margin: 20px 0; }
        .success-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            {{#logo_url}}<img src="{{logo_url}}" alt="{{company_name}}" style="max-height: 60px; margin-bottom: 10px;"><br>{{/logo_url}}
            <h1 style="margin: 0;">{{company_name}}</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Payment Confirmation</p>
        </div>
        <div class="content">
            <div style="text-align: center; margin-bottom: 30px;">
                <span class="success-badge">✓ PAYMENT RECEIVED</span>
            </div>
            <h2 style="color: var(--primary-color, #10b981); margin-top: 0;">Payment Successful!</h2>
            <p>Hi {{participant_name}},</p>
            <p>Thank you for your payment! We have successfully processed your tournament registration fee.</p>
            <div class="payment-details">
                <h3 style="margin-top: 0; color: var(--primary-color, #10b981);">Payment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px 0; font-weight: bold;">Tournament:</td>
                        <td style="padding: 8px 0;">{{tournament_name}}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px 0; font-weight: bold;">Amount Paid:</td>
                        <td style="padding: 8px 0; color: #10b981; font-weight: bold;">{{amount_paid}}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
                        <td style="padding: 8px 0;">{{payment_method}}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td>
                        <td style="padding: 8px 0;">{{transaction_id}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                        <td style="padding: 8px 0;">{{payment_date}}</td>
                    </tr>
                </table>
            </div>
            <p>Your tournament registration is now complete and confirmed.</p>
            <p>If you need a receipt or have questions, contact us with your transaction ID.</p>
        </div>
        <div class="footer">
            <p>{{footer_text}}</p>
            <p>{{company_name}} | {{contact_email}} | {{website_url}}</p>
        </div>
    </div>
</body>
</html>`;
}