export class SmsService {
  //todo add from as a parameter (should be trainers name)
  public static async sendSms(to: string, from: string, text: string) {
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
