"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const mailparser_1 = require("mailparser");
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const client_s3_1 = require("@aws-sdk/client-s3");
const moment_1 = __importDefault(require("moment"));
class MailService {
    host;
    user;
    pass;
    static instance;
    // create singleton instance
    static getInstance() {
        if (!MailService.instance) {
            MailService.instance = new MailService();
        }
        return MailService.instance;
    }
    // Method to initialize configuration
    setConfig(host, user, pass) {
        this.host = host;
        this.user = user;
        this.pass = pass;
    }
    async receiveMail({ attachmentsPath, awsBucket, awsRegion }) {
        const s3 = new client_s3_1.S3({
            region: awsRegion,
            endpoint: `https://s3.${awsRegion}.amazonaws.com`,
        });
        const req = {
            Bucket: awsBucket,
        };
        let mails = [];
        const data = await s3.listObjects(req);
        if (!data.Contents?.length) {
            return [];
        }
        for (let object of data.Contents) {
            try {
                const file = await (await s3.getObject({ ...req, Key: object.Key })).Body.transformToString();
                if (!file)
                    continue;
                const email = await (0, mailparser_1.simpleParser)(file);
                // Attachments path
                //  path.join(__dirname, "../../uploads/attachments");
                //
                const filePath = attachmentsPath;
                if (!fs_1.default.existsSync(filePath)) {
                    fs_1.default.mkdirSync(filePath);
                }
                /*       let attachmentPaths: any[] = [];
                for (let attachment of email.attachments) {
                  if (attachment.filename) {
                    const fileName = v4() + path.extname(attachment.filename);
                    fs.createWriteStream(filePath + "/" + fileName).write(
                      attachment.content,
                    );
                    const dbAttachment = new MailAttachment({
                      fileName: attachment.filename,
                      path: filePath + "/" + fileName,
                      ext: path.extname(attachment.filename),
                    });
                    await dbAttachment.save();
                    attachmentPaths.push(dbAttachment);
                  }
                }*/
                let to;
                if (Array.isArray(email.to)) {
                    to = email.to[0].value[0].address;
                }
                else {
                    to = email.to?.value[0].address;
                }
                mails.push({
                    from: email.from?.value[0].address,
                    to,
                    subject: email.subject,
                    messageHtml: email.html,
                    message: email.textAsHtml,
                    date: email.date,
                    folder: "inbox",
                    seen: false,
                    /*          attachments: attachmentPaths.map((x) => x._id),*/
                });
            }
            catch (e) {
                console.log(e);
            }
        }
        const objects = data.Contents.map((obj) => ({ Key: obj.Key }));
        if (objects.length) {
            await s3.deleteObjects({ ...req, Delete: { Objects: objects } });
        }
        if (mails.length) {
            const mailHtml = `
      <h1>You have ${mails.length} new mails</h1>
      <ul>
        ${mails
                .map((x) => `<li>${(0, moment_1.default)(x.date).format("YYYY-MM-DD h:m")} ${x.to}: ${x.subject}</li>`)
                .join("")}
      </ul>
      `;
            await this.sendMail({
                to: "mikolaj73@gmail.com",
                subject: `You have ${mails.length} new emails on Swaiez.com`,
                html: mailHtml,
            });
        }
        return mails;
    }
    async sendMailTemplate({ to, subject, data, templateFilePath, }) {
        try {
            const filePath = templateFilePath;
            const file = fs_1.default.readFileSync(filePath);
            let templateHtml = file.toString();
            if (data) {
                data.forEach((x) => {
                    templateHtml = templateHtml.split(`{{${x.key}}}`).join(x.replacement);
                });
            }
            await this.sendMail({
                to,
                subject,
                html: templateHtml,
            });
        }
        catch (e) {
            console.error(e.message);
        }
    }
    async sendMail({ to, subject, html, attachments, from, replyTo, }) {
        try {
            let transporter = nodemailer_1.default.createTransport({
                host: this.host,
                port: 587,
                secure: false,
                auth: {
                    user: this.user,
                    pass: this.pass,
                },
                tls: { rejectUnauthorized: false },
            });
            await transporter.sendMail({
                from: from ? from : `"Swaiez" <noreply@swaiez.com>`,
                to,
                subject,
                html,
                attachments,
                replyTo,
            });
            return true;
        }
        catch (e) {
            console.log(e.message);
            return false;
        }
    }
}
exports.MailService = MailService;
