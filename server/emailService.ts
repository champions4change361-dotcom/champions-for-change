import nodemailer from 'nodemailer';

// Email service for sending notifications to newly registered users
class EmailService {
  private transporter: nodemailer.Transporter | null = null;

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

  async sendWelcomeEmail(userEmail: string, firstName: string, role: string, organizationName: string, domain?: string) {
    const emailContent = this.generateWelcomeEmail(firstName, role, organizationName, domain);
    
    try {
      if (!this.transporter) {
        // Fallback: Log email content to console
        console.log('📧 EMAIL NOTIFICATION (would be sent to:', userEmail, ')');
        console.log('Subject:', emailContent.subject);
        console.log('Body:', emailContent.html);
        return { success: true, method: 'console' };
      }

      // Use domain-aware sender address
      const fromAddress = this.getDomainFromAddress(domain);
      
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
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string, domain?: string) {
    const emailContent = this.generatePasswordResetEmail(resetToken, domain);
    
    try {
      if (!this.transporter) {
        // Fallback: Log email content to console
        console.log('📧 PASSWORD RESET EMAIL (would be sent to:', userEmail, ')');
        console.log('Subject:', emailContent.subject);
        console.log('Body:', emailContent.html);
        return { success: true, method: 'console' };
      }

      // Use domain-aware sender address
      const fromAddress = this.getDomainFromAddress(domain);
      
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: userEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      // Different logging for production vs test
      if (process.env.SENDGRID_API_KEY) {
        console.log(`📧 REAL Password reset email sent to ${userEmail} via SendGrid:`, info.messageId);
      } else {
        console.log('📧 Test password reset email sent:', nodemailer.getTestMessageUrl(info));
      }
      
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: process.env.SENDGRID_API_KEY ? null : nodemailer.getTestMessageUrl(info),
        method: process.env.SENDGRID_API_KEY ? 'sendgrid' : 'ethereal'
      };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private generateWelcomeEmail(firstName: string, role: string, organizationName: string, domain?: string) {
    const isChampions = domain?.includes('championsforchange') || false;
    const isTrantor = domain?.includes('trantortournaments') || !isChampions;
    
    if (isChampions) {
      return this.generateChampionsWelcomeEmail(firstName, role, organizationName);
    } else {
      return this.generateTrantorWelcomeEmail(firstName, role, organizationName);
    }
  }

  private generateTrantorWelcomeEmail(firstName: string, role: string, organizationName: string) {
    const roleDisplay = this.formatRoleDisplay(role);
    
    return {
      subject: `Welcome to Trantor Tournaments - Tournament Management Platform`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .role-badge { background: #f97316; color: white; padding: 8px 16px; border-radius: 6px; display: inline-block; margin: 10px 0; }
            .features { background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .features ul { margin: 0; padding-left: 20px; }
            .features li { margin: 8px 0; }
            .cta-button { background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏆 Welcome to Trantor Tournaments</h1>
              <p>Professional Tournament Management Platform</p>
            </div>
            
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              
              <p>Your account has been successfully created on the Trantor Tournaments platform.</p>
              
              <div class="role-badge">${roleDisplay}</div>
              <p><strong>Organization:</strong> ${organizationName}</p>
              
              <div class="features">
                <h3>🎯 Platform Capabilities:</h3>
                <ul>
                  <li>Professional tournament creation and management</li>
                  <li>Custom website building with your branding</li>
                  <li>Advanced registration and payment processing</li>
                  <li>Real-time scheduling and bracket management</li>
                  <li>White-label tournament coordination tools</li>
                  <li>Enterprise-grade analytics and reporting</li>
                </ul>
              </div>
              
              <p><strong>Ready to Get Started?</strong></p>
              <ol>
                <li>Access your tournament dashboard</li>
                <li>Create your first tournament or customize your website</li>
                <li>Explore professional coordination features</li>
                <li>Launch your tournament management platform</li>
              </ol>
              
              <a href="#" class="cta-button">Access Your Platform</a>
              
              <p><strong>Need Support?</strong><br>
              Contact us at champions4change361@gmail.com or 361-300-1552</p>
            </div>
            
            <div class="footer">
              <p>Trantor Tournaments<br>
              Professional Tournament Coordination Intelligence System<br>
              Supporting Tournament Organizers Worldwide</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private generateChampionsWelcomeEmail(firstName: string, role: string, organizationName: string) {
    const roleDisplay = this.formatRoleDisplay(role);
    
    return {
      subject: `Welcome to Champions for Change Tournaments`,
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
              <p>Educational Tournament Opportunities</p>
            </div>
            
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              
              <p>Your account has been successfully created for Champions for Change tournaments.</p>
              
              <div class="role-badge">${roleDisplay}</div>
              <p><strong>Organization:</strong> ${organizationName}</p>
              
              <div class="features">
                <h3>🎓 Tournament Opportunities:</h3>
                <ul>
                  <li>Educational tournaments supporting student growth</li>
                  <li>Community-focused competitive events</li>
                  <li>Scholarship and funding opportunities</li>
                  <li>Local Corpus Christi area tournaments</li>
                  <li>Mission-driven athletic competitions</li>
                </ul>
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Explore upcoming tournament opportunities</li>
                <li>Register for local educational competitions</li>
                <li>Connect with our nonprofit mission</li>
                <li>Support student athletic development</li>
              </ol>
              
              <a href="#" class="cta-button">View Tournaments</a>
              
              <p><strong>Questions?</strong><br>
              Contact us at champions4change361@gmail.com or 361-300-1552</p>
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

  private getDomainFromAddress(domain?: string): string {
    if (domain?.includes('championsforchange')) {
      return process.env.SENDGRID_FROM_EMAIL || '"Champions for Change" <champions4change361@gmail.com>';
    } else {
      return process.env.SENDGRID_FROM_EMAIL || '"Trantor Tournaments" <champions4change361@gmail.com>';
    }
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
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendAdminNewUserNotification(options: {
    userEmail: string;
    userName: string;
    organizationName: string;
    signupMethod: 'trial' | 'oauth' | 'email';
    trialEndDate?: Date;
  }) {
    const adminEmail = process.env.ADMIN_EMAIL || 'champions4change361@gmail.com';
    const { userEmail, userName, organizationName, signupMethod, trialEndDate } = options;
    
    const signupMethodLabel = signupMethod === 'trial' ? '14-Day Free Trial' : 
                             signupMethod === 'oauth' ? 'OAuth (Replit)' : 
                             'Email/Password';
    
    const trialInfo = trialEndDate ? 
      `<li><strong>Trial Ends:</strong> ${trialEndDate.toLocaleDateString()} at ${trialEndDate.toLocaleTimeString()}</li>` : 
      '';
    
    const subject = `🎉 New User Signup - ${userName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e, #3b82f6); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #ffffff; border: 1px solid #e5e7eb; }
          .user-info { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .user-info ul { margin: 10px 0; padding-left: 20px; }
          .user-info li { margin: 8px 0; }
          .signup-badge { 
            background: #3b82f6; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 6px; 
            display: inline-block; 
            margin: 10px 0; 
            font-weight: bold;
          }
          .footer { 
            background: #f9fafb; 
            padding: 20px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New User Signup</h1>
            <p>Someone just joined your platform!</p>
          </div>
          
          <div class="content">
            <div class="signup-badge">${signupMethodLabel}</div>
            
            <div class="user-info">
              <h3>📋 User Details:</h3>
              <ul>
                <li><strong>Name:</strong> ${userName}</li>
                <li><strong>Email:</strong> ${userEmail}</li>
                <li><strong>Organization:</strong> ${organizationName}</li>
                <li><strong>Signup Method:</strong> ${signupMethodLabel}</li>
                ${trialInfo}
                <li><strong>Signup Time:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>User account has been created and is active</li>
              <li>View user details in Platform Admin → User Management</li>
              <li>User can be contacted at ${userEmail}</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Champions for Change Platform<br>
            Admin Notification System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      if (!this.transporter) {
        console.log('📧 ADMIN NOTIFICATION (would be sent to:', adminEmail, ')');
        console.log('Subject:', subject);
        console.log('New user:', userName, '-', userEmail);
        return { success: true, method: 'console' };
      }

      const fromAddress = process.env.SENDGRID_FROM_EMAIL || '"Platform Admin" <champions4change361@gmail.com>';
      
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        subject,
        html,
      });

      if (process.env.SENDGRID_API_KEY) {
        console.log(`📧 Admin notification sent to ${adminEmail} via SendGrid for new user: ${userName}`);
      } else {
        console.log(`📧 Admin notification sent about new user: ${userName}`);
      }
      
      return { 
        success: true, 
        messageId: info.messageId,
        method: process.env.SENDGRID_API_KEY ? 'sendgrid' : 'ethereal'
      };
    } catch (error) {
      console.error('Failed to send admin notification email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendSchoolADInvite(options: { 
    inviteeEmail: string; 
    inviteeName: string; 
    schoolName: string; 
    districtName: string;
    inviteToken: string; 
    invitedBy: string;
    expiresAt: Date;
  }) {
    const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://championsforchange.net';
    const inviteUrl = `${baseUrl}/register/school-ad?token=${options.inviteToken}`;
    const expiresInDays = Math.ceil((options.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    const subject = `You've been invited to join ${options.schoolName} as Athletic Director`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e, #3b82f6); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #ffffff; border: 1px solid #e5e7eb; }
          .invite-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .cta-button { 
            background: #22c55e; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block; 
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
          }
          .footer { 
            background: #f9fafb; 
            padding: 20px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .expiry-notice { color: #dc2626; font-weight: bold; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏫 School Athletic Director Invitation</h1>
            <p>Champions for Change Athletics Platform</p>
          </div>
          
          <div class="content">
            <h2>Hello ${options.inviteeName}!</h2>
            
            <p><strong>${options.invitedBy}</strong> has invited you to join <strong>${options.schoolName}</strong> as an Athletic Director.</p>
            
            <div class="invite-box">
              <h3>📋 Invitation Details:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>School:</strong> ${options.schoolName}</li>
                <li><strong>District:</strong> ${options.districtName}</li>
                <li><strong>Role:</strong> School Athletic Director</li>
                <li><strong>Invited By:</strong> ${options.invitedBy}</li>
              </ul>
            </div>
            
            <p><strong>Platform Capabilities:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Manage your school's athletic programs and teams</li>
              <li>Coordinate with coaches and athletic trainers</li>
              <li>Track student athlete health and eligibility</li>
              <li>Schedule competitions and manage facilities</li>
              <li>Access district-wide resources and analytics</li>
              <li>Manage feeder school relationships (VLC hierarchy)</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${inviteUrl}" class="cta-button">Accept Invitation & Register</a>
            </div>
            
            <p class="expiry-notice">⏰ This invitation expires in ${expiresInDays} days</p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              <strong>Need help?</strong><br>
              Contact us at champions4change361@gmail.com or 361-300-1552
            </p>
          </div>
          
          <div class="footer">
            <p>Champions for Change<br>
            Athletic & Academic Management Platform<br>
            Supporting Educational Excellence</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      if (!this.transporter) {
        console.log('📧 SCHOOL AD INVITE EMAIL (would be sent to:', options.inviteeEmail, ')');
        console.log('Subject:', subject);
        console.log('Invite URL:', inviteUrl);
        return { success: true, method: 'console' };
      }

      const fromAddress = process.env.SENDGRID_FROM_EMAIL || '"Champions for Change" <champions4change361@gmail.com>';
      
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: options.inviteeEmail,
        subject,
        html,
      });

      if (process.env.SENDGRID_API_KEY) {
        console.log(`📧 School AD invite sent to ${options.inviteeEmail} via SendGrid:`, info.messageId);
      } else {
        console.log(`📧 Test school AD invite sent:`, nodemailer.getTestMessageUrl(info));
      }
      
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: process.env.SENDGRID_API_KEY ? null : nodemailer.getTestMessageUrl(info),
        method: process.env.SENDGRID_API_KEY ? 'sendgrid' : 'ethereal'
      };
    } catch (error) {
      console.error('Failed to send school AD invite email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private generatePasswordResetEmail(resetToken: string, domain?: string) {
    const isChampions = domain?.includes('championsforchange') || false;
    const baseUrl = domain ? `https://${domain}` : 'https://trantortournaments.org';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    const brandColor = isChampions ? '#10b981' : '#f97316'; // Green for Champions, Orange for Trantor
    const brandName = isChampions ? 'Champions for Change' : 'Trantor Tournaments';
    
    return {
      subject: `Reset Your ${brandName} Password`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${brandColor}; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px 20px; background: #ffffff; border: 1px solid #e5e7eb; }
            .security-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .reset-button { 
              background: ${brandColor}; 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 6px; 
              display: inline-block; 
              margin: 20px 0;
              text-align: center;
              font-weight: bold;
            }
            .footer { 
              background: #f9fafb; 
              padding: 20px; 
              text-align: center; 
              color: #6b7280; 
              font-size: 14px; 
              border-radius: 0 0 8px 8px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .expiry-info { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${brandName}</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
              
              <p style="color: #4b5563; margin-bottom: 20px;">
                We received a request to reset your password for your ${brandName} account. 
                Click the button below to create a new password:
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="reset-button" style="color: white; text-decoration: none;">
                  Reset My Password
                </a>
              </div>

              <div class="expiry-info">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  ⏰ <strong>This link expires in 1 hour</strong> for your security.
                </p>
              </div>

              <div class="security-notice">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  🛡️ <strong>Security Notice:</strong> If you didn't request this password reset, 
                  please ignore this email. Your account remains secure.
                </p>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="word-break: break-all; color: ${brandColor};">${resetUrl}</span>
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">
                ${isChampions ? '💚 Supporting educational opportunities for underprivileged youth' : '🏆 Professional tournament management made simple'}
              </p>
              <p style="margin: 10px 0 0 0;">
                ${brandName} • Tournament Platform
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
}

export const emailService = new EmailService();