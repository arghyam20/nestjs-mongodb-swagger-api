import { Injectable } from '@nestjs/common';
import { join } from 'path';
import nodemailer from 'nodemailer';
import Email from 'email-templates';

@Injectable()
export class MailerService {
  async sendMail(
    to: string | string[],
    subject: string,
    tplName: string,
    locals: any,
  ): Promise<boolean> {
    const templateDir = join(
      __dirname,
      '../../views/email-templates',
      tplName,
      'html',
    );

    const email = new Email({
      views: {
        root: templateDir,
        options: {
          extension: 'ejs',
        },
      },
    });

    const getMailBody = await email.render(templateDir, locals);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: {
        name: 'My Project',
        address: process.env.MAIL_USERNAME,
      },
      to,
      subject,
      html: getMailBody,
    };

    await transporter.verify();
    await transporter.sendMail(mailOptions);
    return true;
  }
}
