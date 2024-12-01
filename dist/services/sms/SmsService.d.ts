export declare class SmsService {
    static sendSms(to: string, from: string, text: string): Promise<void>;
    static checkBalance(): Promise<any>;
}
