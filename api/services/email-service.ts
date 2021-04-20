import nodemailer from "nodemailer";
import TemplateService from "./template-service";

const transporter = nodemailer.createTransport({
  host: process.env.MAILSERVER_ADDRESS,
  port: process.env.MAILSERVER_PORT,
  secure: false,
  auth: {
    user: process.env.MAILSERVER_USERNAME,
    pass: process.env.MAILSERVER_PASSWORD,
  },
  pool: true,
});

export default class EmailService {
  static async verifyConnection(): Promise<boolean> {
    return await transporter.verify();
  }

  static async send(
    to: string,
    subject: string,
    body: string,
  ): Promise<unknown | null> {
    const payload = {
      from: "JobFair Meetup <dontreply-jobfair@fer.hr>",
      replyTo: "jobfair@fer.hr",
      to,
      subject,
      html: body,
    };

    try {
      return await transporter.sendMail(payload);
    } catch (e) {
      return null;
    }
  }

  static async sendTemplate(
    to: string,
    subject: string,
    templateName: string,
    templateData: Record<string, unknown>,
  ) {
    const body = await TemplateService.render(
      templateName,
      templateData,
    );

    return await this.send(to, subject, body);
  }
}
