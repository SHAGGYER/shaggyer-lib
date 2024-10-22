import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import fs from "fs";
import { S3 } from "@aws-sdk/client-s3";
import moment from "moment";

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

export class MailService {
  private host: string;
  private user: string;
  private pass: string;
  private static instance: MailService;

  // create singleton instance
  public static getInstance(): MailService {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  // Method to initialize configuration
  public setConfig(host: string, user: string, pass: string): void {
    this.host = host;
    this.user = user;
    this.pass = pass;
  }

  public async receiveMail({ attachmentsPath, awsBucket, awsRegion }) {
    const s3 = new S3({
      region: awsRegion,
      endpoint: `https://s3.${awsRegion}.amazonaws.com`,
    });

    const req: any = {
      Bucket: awsBucket,
    };

    let mails: any[] = [];
    const data = await s3.listObjects(req);

    if (!data.Contents?.length) {
      return [];
    }

    for (let object of data.Contents) {
      try {
        const file = await (
          await s3.getObject({ ...req, Key: object.Key })
        ).Body!.transformToString();

        if (!file) continue;
        const email = await simpleParser(file);

        // Attachments path
        //  path.join(__dirname, "../../uploads/attachments");
        //

        const filePath = attachmentsPath;
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath);
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

        let to: string | undefined;

        if (Array.isArray(email.to)) {
          to = email.to[0].value[0].address;
        } else {
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
      } catch (e) {
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
          .map(
            (x) =>
              `<li>${moment(x.date).format("YYYY-MM-DD h:m")} ${x.to}: ${
                x.subject
              }</li>`
          )
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
  async sendMailTemplate({
    to,
    subject,
    data,
    templateFilePath,
  }: {
    to: string;
    subject: string;
    data?: any[];
    templateFilePath: string;
  }) {
    try {
      const filePath = templateFilePath;
      const file = fs.readFileSync(filePath);
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
    } catch (e) {
      console.log(e.message);
    }
  }

  public async sendMail({
    to,
    subject,
    html,
    attachments,
    from,
    replyTo,
  }: ISendMailParams) {
    try {
      let transporter = nodemailer.createTransport({
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
    } catch (e) {
      console.log(e.message);
      return false;
    }
  }
}
