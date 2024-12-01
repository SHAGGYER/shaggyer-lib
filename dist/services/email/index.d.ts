export interface ISendMailParams {
    to: string;
    subject: string;
    html: string;
    attachments?: any;
    from?: string;
    replyTo?: string;
}
export interface IReceiveMailParams {
    attachmentsPath: string;
    awsBucket: string;
    awsRegion: string;
}
export declare class MailService {
    private host;
    private user;
    private pass;
    private static instance;
    static getInstance(): MailService;
    setConfig(host: string, user: string, pass: string): void;
    receiveMail({ attachmentsPath, awsBucket, awsRegion }: {
        attachmentsPath: any;
        awsBucket: any;
        awsRegion: any;
    }): Promise<any[]>;
    sendMailTemplate({ to, subject, data, templateFilePath, }: {
        to: string;
        subject: string;
        data?: any[];
        templateFilePath: string;
    }): Promise<void>;
    sendMail({ to, subject, html, attachments, from, replyTo, }: ISendMailParams): Promise<boolean>;
}
