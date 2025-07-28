import { SendMailClient } from 'zeptomail';

// Define the template types available in the system
export enum EmailTemplateType {
  VERIFICATION = 'VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  WELCOME = 'WELCOME',
  LOAN_APPROVAL = 'LOAN_APPROVAL',
  LOAN_REJECTION = 'LOAN_REJECTION',
  LOAN_APPLICATION_NOTIFICATION = 'LOAN_APPLICATION_NOTIFICATION',
  LOAN_REPAYMENT_REMINDER = 'LOAN_REPAYMENT_REMINDER',
  INVESTMENT_MATURITY = 'INVESTMENT_MATURITY',
  NOTIFICATION = 'NOTIFICATION',
  LOGIN_ALERT = 'LOGIN_ALERT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
}

// Define recipient structure
export interface EmailRecipient {
  email: string;
  name?: string;
  variables?: Record<string, any>;
}

export class EmailService {
  private readonly templateClient: SendMailClient;

  constructor() {
    // Get the token from environment variables
    const token = process.env.ZEPTOMAIL_TOKEN;

    // Log token status for debugging (without exposing the actual token)
    console.log(`ZeptoMail token status: ${token ? 'Found' : 'Missing'}`);

    if (!token) {
      console.error(
        'ZEPTOMAIL_TOKEN is not configured in environment variables',
      );
      throw new Error(
        'ZEPTOMAIL_TOKEN is required but not found in environment variables',
      );
    }

    try {
      // Initialize client for template-based emails
      this.templateClient = new SendMailClient({
        url: 'api.zeptomail.com/v1.1/email/template',
        token: token,
      });

      console.log('ZeptoMail client initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(
        'Failed to initialize ZeptoMail client:',
        errorMessage,
      );
      throw error;
    }
  }

  /**
   * Get the template key for a specific template type from environment variables
   */
  private getTemplateKey(templateType: EmailTemplateType): string | null {
    const key = process.env[`EMAIL_TEMPLATE_${templateType}`];

    if (!key) {
      console.error(
        `Template key for ${templateType} not found in environment variables. Please set EMAIL_TEMPLATE_${templateType} in your .env file.`,
      );
      return null;
    }

    return key;
  }

  /**
   * Send an email to a single recipient using a template
   */
  async sendTemplateEmail(
    templateType: EmailTemplateType,
    recipient: EmailRecipient,
    variables?: Record<string, any>,
  ): Promise<boolean> {
    try {
      const templateKey = this.getTemplateKey(templateType);

      if (!templateKey) {
        console.error(
          `Cannot send ${templateType} email to ${recipient.email}: Template key not configured`,
        );
        return false;
      }

      const mergeVariables = variables || recipient.variables || {};

      // Add default variables that might be useful in templates
      const defaultVariables = {
        recipient_name: recipient.name || recipient.email.split('@')[0],
        recipient_email: recipient.email,
        company_name: 'LiteFi',
        support_email:
          process.env.SUPPORT_EMAIL ||
          'support@litefi.ng',
        website_url:
          process.env.WEBSITE_URL || 'https://litefi.ng',
        ...mergeVariables,
      };

      console.log(
        `Sending ${templateType} email to ${recipient.email} using template key: ${templateKey}`,
      );
      console.log('Template variables being sent:', JSON.stringify(defaultVariables, null, 2));

      const emailPayload = {
        mail_template_key: templateKey,
        from: {
          address:
            process.env.FROM_EMAIL || 'noreply@litefi.ng',
          name: process.env.FROM_NAME || 'LiteFi',
        },
        to: [
          {
            email_address: {
              address: recipient.email,
              name: recipient.name || recipient.email.split('@')[0],
            },
          },
        ],
        merge_info: defaultVariables,
      };
      
      console.log('Full email payload:', JSON.stringify(emailPayload, null, 2));
      
      await this.templateClient.sendMailWithTemplate(emailPayload);

      console.log(
        `✅ Email sent successfully to ${recipient.email} using template ${templateType}`,
      );
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `❌ Failed to send ${templateType} email to ${recipient.email}: ${errorMessage}`,
      );

      // Log additional error details for debugging
      if (error && typeof error === 'object' && 'response' in error) {
        console.error(`ZeptoMail API Error Response:`, (error as any).response?.data);
      }

      return false;
    }
  }

  /**
   * Send an email to multiple recipients using a template
   */
  async sendBulkTemplateEmail(
    templateType: EmailTemplateType,
    recipients: EmailRecipient[],
  ): Promise<{ success: number; failed: number }> {
    const results = await Promise.allSettled(
      recipients.map((recipient) =>
        this.sendTemplateEmail(templateType, recipient),
      ),
    );

    const success = results.filter(
      (result) => result.status === 'fulfilled' && result.value === true,
    ).length;
    const failed = results.length - success;

    console.log(
      `Bulk email ${templateType}: ${success} sent, ${failed} failed`,
    );

    return { success, failed };
  }

  /**
   * Send verification email with OTP code
   */
  async sendVerificationEmail(email: string, code: string): Promise<boolean> {
    return this.sendTemplateEmail(
      EmailTemplateType.VERIFICATION,
      { email },
      {
        code,
        valid_time: '30 minutes',
      },
    );
  }

  /**
   * Send password reset email with reset code
   */
  async sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
    return this.sendTemplateEmail(
      EmailTemplateType.PASSWORD_RESET,
      { email },
      {
        code,
        valid_time: '15 minutes',
      },
    );
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    return this.sendTemplateEmail(
      EmailTemplateType.WELCOME,
      { email, name: firstName },
      {
        first_name: firstName,
      },
    );
  }

  /**
   * Send loan approval notification
   */
  async sendLoanApprovalEmail(
    email: string,
    name: string,
    loanDetails: {
      amount: number;
      formattedAmount: string;
      loanId: string;
      duration: number;
      totalPayable: number;
      formattedTotalPayable: string;
      disbursementDate: string;
    },
  ): Promise<boolean> {
    return this.sendTemplateEmail(
      EmailTemplateType.LOAN_APPROVAL,
      { email, name },
      {
        formattedAmount: loanDetails.formattedAmount,
        loanId: loanDetails.loanId,
        duration: loanDetails.duration,
        formattedTotalPayable: loanDetails.formattedTotalPayable,
        disbursementDate: loanDetails.disbursementDate,
        support_id: process.env.SUPPORT_EMAIL || 'support@litefi.ng',
        brand: 'LiteFi',
      },
    );
  }

  /**
   * Send loan rejection notification
   */
  async sendLoanRejectionEmail(
    email: string,
    name: string,
    loanDetails: {
      amount: number;
      formattedAmount: string;
      applicationId: string;
      loanType: string;
      applicationDate: string;
    },
  ): Promise<boolean> {
    console.log('📧 Sending loan rejection email to:', email);
    console.log('📋 Loan details:', {
      applicationId: loanDetails.applicationId,
      loanType: loanDetails.loanType,
      formattedAmount: loanDetails.formattedAmount,
      applicationDate: loanDetails.applicationDate
    });
    
    return this.sendTemplateEmail(
      EmailTemplateType.LOAN_REJECTION,
      { email, name },
      {
        applicationId: loanDetails.applicationId,
        loanType: loanDetails.loanType,
        formattedAmount: loanDetails.formattedAmount,
        applicationDate: loanDetails.applicationDate,
        support_id: process.env.SUPPORT_EMAIL || 'support@litefi.ng',
        brand: 'LiteFi',
      },
    );
  }

  /**
   * Send loan application notification
   */
  async sendLoanApplicationNotificationEmail(
    email: string,
    name: string,
    applicationDetails: {
      applicationId: string;
      loanType: string;
      amount: number;
      formattedAmount: string;
      duration: number;
      applicationDate: string;
    },
  ): Promise<boolean> {
    console.log('📧 Sending loan application notification email to:', email);
    console.log('📋 Application details:', {
      applicationId: applicationDetails.applicationId,
      loanType: applicationDetails.loanType,
      formattedAmount: applicationDetails.formattedAmount,
      duration: applicationDetails.duration,
      applicationDate: applicationDetails.applicationDate
    });
    
    return this.sendTemplateEmail(
      EmailTemplateType.LOAN_APPLICATION_NOTIFICATION,
      { email, name },
      {
        applicationId: applicationDetails.applicationId,
        loanType: applicationDetails.loanType,
        formattedAmount: applicationDetails.formattedAmount,
        duration: applicationDetails.duration,
        applicationDate: applicationDetails.applicationDate,
        support_id: process.env.SUPPORT_EMAIL || 'support@litefi.ng',
        brand: 'LiteFi',
      },
    );
  }

  /**
   * Send investment maturity notification
   */
  async sendInvestmentMaturityEmail(
    email: string,
    name: string,
    investmentDetails: {
      planName: string;
      amount: number;
      formattedAmount: string;
      reference: string;
      startDate: string;
      maturityDate: string;
      interestAccrued: number;
      formattedInterestAccrued: string;
      totalReturns: number;
      formattedTotalReturns: string;
    },
  ): Promise<boolean> {
    return this.sendTemplateEmail(
      EmailTemplateType.INVESTMENT_MATURITY,
      { email, name },
      {
        plan_name: investmentDetails.planName,
        investment_amount: investmentDetails.formattedAmount,
        investment_reference: investmentDetails.reference,
        start_date: investmentDetails.startDate,
        maturity_date: investmentDetails.maturityDate,
        interest_accrued: investmentDetails.formattedInterestAccrued,
        total_returns: investmentDetails.formattedTotalReturns,
      },
    );
  }

  /**
   * Send loan repayment reminder
   */
  async sendLoanRepaymentReminderEmail(
    email: string,
    name: string,
    repaymentDetails: {
      loanReference: string;
      amount: number;
      formattedAmount: string;
      dueDate: string;
      daysLeft: number;
    },
  ): Promise<boolean> {
    return this.sendTemplateEmail(
      EmailTemplateType.LOAN_REPAYMENT_REMINDER,
      { email, name },
      {
        loan_reference: repaymentDetails.loanReference,
        repayment_amount: repaymentDetails.formattedAmount,
        due_date: repaymentDetails.dueDate,
        days_left: repaymentDetails.daysLeft,
      },
    );
  }

  /**
   * Send login alert notification
   */
  async sendLoginAlertEmail(
    email: string,
    ipAddress: string,
    device: string,
    location: string,
  ): Promise<boolean> {
    return this.sendTemplateEmail(
      EmailTemplateType.LOGIN_ALERT,
      { email },
      {
        dateTime: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        ipAddress,
        device,
        location,
      },
    );
  }

  /**
   * Send generic notification email
   */
  async sendNotificationEmail(
    email: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    return this.sendTemplateEmail(
      EmailTemplateType.NOTIFICATION,
      { email },
      {
        notification_subject: subject,
        notification_message: message,
      },
    );
  }

  /**
   * Send password changed confirmation
   */
  async sendPasswordChangedEmail(email: string): Promise<boolean> {
    return this.sendTemplateEmail(
      EmailTemplateType.PASSWORD_CHANGED,
      { email },
      {
        change_time: new Date().toLocaleString(),
      },
    );
  }

  /**
   * Validate that all required template keys are configured
   */
  validateTemplateConfiguration(): {
    isValid: boolean;
    missingTemplates: EmailTemplateType[];
  } {
    const missingTemplates: EmailTemplateType[] = [];

    Object.values(EmailTemplateType).forEach((templateType) => {
      const key = this.getTemplateKey(templateType);
      if (!key) {
        missingTemplates.push(templateType);
      }
    });

    const isValid = missingTemplates.length === 0;

    if (!isValid) {
      console.warn(
        `Missing template keys for: ${missingTemplates.join(', ')}`,
      );
    } else {
      console.log('All email templates are properly configured');
    }

    return { isValid, missingTemplates };
  }
}

// Create and export a singleton instance
let emailServiceInstance: EmailService | null = null;

export const getEmailService = (): EmailService => {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
};

// Export the singleton instance for direct use
export const emailService = getEmailService();
