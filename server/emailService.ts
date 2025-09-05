import nodemailer from 'nodemailer';

// Email service for sending notifications to newly registered users
class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // For development, use ethereal email (fake SMTP service)
    // In production, you would use real SMTP credentials
    this.setupTransporter();
  }

  private async setupTransporter() {
    try {
      // Check if SendGrid API key is available for production email
      if (process.env.SENDGRID_API_KEY) {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY,
          },
        });
        console.log('📧 Email service initialized with SendGrid (production)');
        return;
      }

      // Fallback to test account for development
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('📧 Email service initialized with test account (development)');
    } catch (error) {
      console.error('Failed to setup email transporter:', error);
      // Fallback to console logging in development
      this.transporter = null as any;
    }
  }

  async sendWelcomeEmail(userEmail: string, firstName: string, role: string, organizationName: string) {
    const emailContent = this.generateWelcomeEmail(firstName, role, organizationName);
    
    try {
      if (!this.transporter) {
        // Fallback: Log email content to console
        console.log('📧 EMAIL NOTIFICATION (would be sent to:', userEmail, ')');
        console.log('Subject:', emailContent.subject);
        console.log('Body:', emailContent.html);
        return { success: true, method: 'console' };
      }

      // Use a verified sender address for SendGrid
      const fromAddress = process.env.SENDGRID_FROM_EMAIL || '"Champions for Change Athletics" <athletics@championsforchange.org>';
      
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: userEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      // Different logging for production vs test
      if (process.env.SENDGRID_API_KEY) {
        console.log(`📧 REAL Welcome email sent to ${userEmail} via SendGrid:`, info.messageId);
      } else {
        console.log('📧 Test welcome email sent:', nodemailer.getTestMessageUrl(info));
      }
      
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: process.env.SENDGRID_API_KEY ? null : nodemailer.getTestMessageUrl(info),
        method: process.env.SENDGRID_API_KEY ? 'sendgrid' : 'ethereal'
      };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  private generateWelcomeEmail(firstName: string, role: string, organizationName: string) {
    const roleDisplay = this.formatRoleDisplay(role);
    
    return {
      subject: `Welcome to Champions for Change Athletics - ${roleDisplay} Access`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e, #3b82f6); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .role-badge { background: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; display: inline-block; margin: 10px 0; }
            .features { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .features ul { margin: 0; padding-left: 20px; }
            .features li { margin: 8px 0; }
            .cta-button { background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏆 Welcome to Champions for Change</h1>
              <p>District Athletics Management Platform</p>
            </div>
            
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              
              <p>Your account has been successfully created in the Champions for Change athletics management platform.</p>
              
              <div class="role-badge">${roleDisplay}</div>
              <p><strong>Organization:</strong> ${organizationName}</p>
              
              <div class="features">
                <h3>Your Role Capabilities:</h3>
                ${this.getRoleFeatures(role)}
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Visit the Champions for Change Athletics platform</li>
                <li>Use your email address to log in</li>
                <li>Access your role-specific dashboard</li>
                <li>Begin managing your athletic programs</li>
              </ol>
              
              <a href="#" class="cta-button">Access Your Dashboard</a>
              
              <p><strong>Need Help?</strong><br>
              Contact our support team or your district administrator for assistance.</p>
            </div>
            
            <div class="footer">
              <p>Champions for Change<br>
              Supporting Educational Opportunities for Underprivileged Youth<br>
              Corpus Christi, Texas</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // Generic send method for custom emails
  async send(options: { to: string; subject: string; html: string; }) {
    try {
      if (!this.transporter) {
        // Fallback: Log email content to console
        console.log('📧 EMAIL NOTIFICATION (would be sent to:', options.to, ')');
        console.log('Subject:', options.subject);
        console.log('Body:', options.html);
        return { success: true, method: 'console' };
      }

      const fromAddress = process.env.SENDGRID_FROM_EMAIL || '"Champions for Change Athletics" <athletics@championsforchange.org>';
      
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (process.env.SENDGRID_API_KEY) {
        console.log(`📧 Email sent to ${options.to} via SendGrid:`, info.messageId);
      } else {
        console.log('📧 Test email sent:', nodemailer.getTestMessageUrl(info));
      }
      
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: process.env.SENDGRID_API_KEY ? null : nodemailer.getTestMessageUrl(info),
        method: process.env.SENDGRID_API_KEY ? 'sendgrid' : 'ethereal'
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  // Team captain confirmation email
  async sendTeamCaptainConfirmation(options: { captainEmail: string; captainName: string; teamName: string; tournamentName: string; }) {
    const html = `
      <h2>Team Registration Confirmation</h2>
      <p>Hi ${options.captainName},</p>
      <p>Your team "${options.teamName}" has been successfully registered for ${options.tournamentName}.</p>
      <p>You will receive further instructions as the tournament approaches.</p>
      <p>Best regards,<br>Tournament Management Team</p>
    `;
    
    return this.send({
      to: options.captainEmail,
      subject: `Team Registration Confirmed - ${options.tournamentName}`,
      html
    });
  }

  // Player join confirmation email
  async sendPlayerJoinConfirmation(options: { parentEmail: string; parentName: string; playerName: string; teamName: string; }) {
    const html = `
      <h2>Player Registration Confirmation</h2>
      <p>Hi ${options.parentName},</p>
      <p>${options.playerName} has been successfully added to team "${options.teamName}".</p>
      <p>You will receive further updates about the tournament schedule.</p>
      <p>Best regards,<br>Tournament Management Team</p>
    `;
    
    return this.send({
      to: options.parentEmail,
      subject: `Player Registration Confirmed - ${options.playerName}`,
      html
    });
  }

  // Payment confirmation email
  async sendPaymentConfirmation(options: { recipientEmail: string; paymentAmount: number; teamName: string; }) {
    const html = `
      <h2>Payment Confirmation</h2>
      <p>Thank you for your payment of $${options.paymentAmount.toFixed(2)} for team "${options.teamName}".</p>
      <p>Your registration is now complete.</p>
      <p>Best regards,<br>Tournament Management Team</p>
    `;
    
    return this.send({
      to: options.recipientEmail,
      subject: `Payment Confirmed - $${options.paymentAmount.toFixed(2)}`,
      html
    });
  }

  private formatRoleDisplay(role: string): string {
    const roleMap: Record<string, string> = {
      'district_athletic_director': 'District Athletic Director',
      'district_head_athletic_trainer': 'District Head Athletic Trainer',
      'school_athletic_director': 'School Athletic Director',
      'school_athletic_trainer': 'School Athletic Trainer',
      'school_principal': 'School Principal',
      'head_coach': 'Head Coach',
      'assistant_coach': 'Assistant Coach',
      'athletic_training_student': 'Athletic Training Student',
    };
    return roleMap[role] || role;
  }

  private getRoleFeatures(role: string): string {
    const features: Record<string, string[]> = {
      'district_athletic_director': [
        'Manage all district athletics programs',
        'Register and oversee staff members',
        'Access district-wide analytics and reporting',
        'Coordinate with multiple schools'
      ],
      'district_head_athletic_trainer': [
        'Supervise all district athletic trainers',
        'Manage district-wide health protocols',
        'Access comprehensive medical records',
        'Coordinate emergency response procedures'
      ],
      'school_athletic_director': [
        'Manage school athletic programs',
        'Coordinate with coaches and staff',
        'Schedule competitions and events',
        'Monitor student athlete eligibility'
      ],
      'school_athletic_trainer': [
        'Track and monitor student athlete health',
        'Manage injury care plans and medical documentation',
        'Communicate with doctors, parents, and coaches',
        'Maintain medical supply inventory and equipment'
      ],
      'school_principal': [
        'Oversee all school athletic activities',
        'Access school performance reports',
        'Manage staff and student compliance',
        'Coordinate with district administration'
      ],
      'head_coach': [
        'Manage team roster and player development',
        'Schedule practices and coordinate games',
        'Register for tournaments and competitions',
        'Track team performance and statistics'
      ],
      'assistant_coach': [
        'Support head coach with team management',
        'Assist with practice planning and execution',
        'Help with tournament registration',
        'Monitor player progress and development'
      ],
      'athletic_training_student': [
        'Learn from certified athletic trainers',
        'Assist with basic health monitoring',
        'Gain hands-on experience in sports medicine',
        'Support injury prevention and care'
      ]
    };

    const roleFeatures = features[role] || ['General platform access'];
    return '<ul>' + roleFeatures.map(feature => `<li>${feature}</li>`).join('') + '</ul>';
  }

  async sendTournamentWelcomeEmail(options: { email: string; sports: string[]; frequency: string }) {
    const { email, sports, frequency } = options;
    const sportsList = sports.length > 0 ? sports.join(', ') : 'All Sports';

    const subject = '🎯 Tournament Notifications Activated!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a202c; margin: 0;">🏆 Champions for Change</h1>
            <p style="color: #718096; margin: 5px 0 0 0;">Tournament Platform</p>
          </div>
          
          <div style="background: #f7fafc; border-left: 4px solid #38b2ac; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #2d3748; margin: 0 0 10px 0;">🎯 You're All Set!</h2>
            <p style="color: #4a5568; margin: 0; line-height: 1.6;">
              Welcome to the tournament community! You'll now receive notifications about exciting tournaments in your area.
            </p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2d3748; margin-bottom: 15px;">📧 Your Subscription Details:</h3>
            <ul style="color: #4a5568; padding-left: 20px; line-height: 1.8;">
              <li><strong>Sports Interest:</strong> ${sportsList}</li>
              <li><strong>Frequency:</strong> ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} updates</li>
              <li><strong>Email:</strong> ${email}</li>
            </ul>
          </div>
          
          <div style="text-align: center; color: #718096; font-size: 12px;">
            <p style="margin: 0;">Champions for Change • Tournament Platform</p>
          </div>
        </div>
      </div>
    `;

    try {
      if (!this.transporter) {
        console.log('📧 TOURNAMENT SUBSCRIPTION EMAIL (would be sent to:', email, ')');
        console.log('Subject:', subject);
        console.log('Sports:', sportsList, '| Frequency:', frequency);
        return { success: true, method: 'console' };
      }

      const fromAddress = process.env.SENDGRID_FROM_EMAIL || '"Champions for Change" <Champions4change361@gmail.com>';
      
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: email,
        subject,
        html,
      });

      if (process.env.SENDGRID_API_KEY) {
        console.log(`📧 Tournament subscription email sent to ${email} via SendGrid:`, info.messageId);
      } else {
        console.log(`📧 Tournament subscription email sent to ${email}`);
      }
      
      return { success: true, method: 'email', messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send tournament welcome email:', error);
      return { success: false, error: error.message };
    }
  }
}

export const emailService = new EmailService();