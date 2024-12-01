"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
class SmsService {
    //todo add from as a parameter (should be trainers name)
    static async sendSms(to, from, text) {
        const { Vonage } = require("@vonage/server-sdk");
        const vonage = new Vonage({
            apiKey: process.env.VONAGE_API_KEY,
            apiSecret: process.env.VONAGE_API_SECRET,
        });
        await vonage.sms.send({ to, from, text });
    }
    static async checkBalance() {
        const { Vonage } = require("@vonage/server-sdk");
        const vonage = new Vonage({
            apiKey: process.env.VONAGE_API_KEY,
            apiSecret: process.env.VONAGE_API_SECRET,
        });
        return await vonage.accounts.getBalance();
    }
}
exports.SmsService = SmsService;
