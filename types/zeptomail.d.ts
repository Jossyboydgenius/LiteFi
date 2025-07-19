declare module 'zeptomail' {
  export interface EmailAddress {
    address: string;
    name?: string;
  }

  export interface EmailRecipient {
    email_address: EmailAddress;
  }

  export interface EmailFrom {
    address: string;
    name?: string;
  }

  export interface SendMailTemplateOptions {
    mail_template_key: string;
    from: EmailFrom;
    to: EmailRecipient[];
    merge_info?: Record<string, any>;
  }

  export interface SendMailClientConfig {
    url: string;
    token: string;
  }

  export class SendMailClient {
    constructor(config: SendMailClientConfig);
    sendMailWithTemplate(options: SendMailTemplateOptions): Promise<any>;
  }
}