import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { resetPasswordTemplate } from './templates/reset-password.template';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST')!;
    const port = this.config.get<number>('SMTP_PORT')!;
    const secure = this.config.get<boolean>('SMTP_SECURE')!;
    const user = this.config.get<string>('SMTP_USER')!;
    const pass = this.config.get<string>('SMTP_PASS')!;
    this.from = this.config.get<string>('SMTP_FROM')!;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  async sendResetPasswordEmail(params: {
    to: string;
    resetLink: string;
    expiresMinutes: number;
    appName?: string;
  }) {
    const subject = `${params.appName ?? 'App'} — Restablecer contraseña`;
    const html = resetPasswordTemplate({
      appName: params.appName ?? 'App',
      resetLink: params.resetLink,
      expiresMinutes: params.expiresMinutes,
    });

    await this.transporter.sendMail({
      from: this.from,
      to: params.to,
      subject,
      html,
      text: `Restablece tu contraseña aquí: ${params.resetLink} (expira en ${params.expiresMinutes} min)`,
    });
  }
}
