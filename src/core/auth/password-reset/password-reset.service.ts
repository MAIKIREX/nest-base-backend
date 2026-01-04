import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ConfigType } from '@nestjs/config';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Inject } from '@nestjs/common';

import passwordResetConfig from '../../config/auth/password-reset.config';
import { UsersService } from '../../../application/users/users.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { User } from '../../../application/users/entities/user.entity';
import { MailerService } from '../../mailer/mailer.service';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly resetRepo: Repository<PasswordResetToken>,
    private readonly usersService: UsersService,
    private readonly mailer: MailerService,
    private readonly dataSource: DataSource,
    @Inject(passwordResetConfig.KEY)
    private readonly cfg: ConfigType<typeof passwordResetConfig>,
  ) {}

  private toBase64Url(buf: Buffer) {
    return buf
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private hashToken(token: string) {
    return crypto
      .createHash('sha256')
      .update(`${token}${this.cfg.pepper}`)
      .digest('hex');
  }

  private buildResetLink(token: string) {
    const base = (this.cfg.frontendPublicUrl || '').replace(/\/+$/, '');
    const path = (
      this.cfg.frontendResetPath || '/auth/update-password'
    ).startsWith('/')
      ? this.cfg.frontendResetPath
      : `/${this.cfg.frontendResetPath}`;

    return `${base}${path}?token=${encodeURIComponent(token)}`;
  }

  async requestPasswordReset(params: {
    email: string;
    requestIp?: string;
    userAgent?: string;
  }) {
    // Respuesta SIEMPRE genérica (anti-enumeración)
    const genericResponse = {
      message:
        'Si el correo existe, enviaremos instrucciones para restablecer la contraseña.',
    };

    const user = await this.usersService.getUserByEmail(params.email);
    if (!user) return genericResponse;

    const now = Date.now();
    const windowStart = new Date(now - this.cfg.windowMs);

    // 1) cooldown: último envío
    const last = await this.resetRepo.findOne({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      select: ['id', 'createdAt'],
    });

    // si pidió hace muy poco, no enviamos otro correo
    if (last && now - last.createdAt.getTime() < this.cfg.cooldownMs) {
      return genericResponse;
    }

    // 2) max por ventana: cuántos emitiste en la última hora (o windowMs)
    const countInWindow = await this.resetRepo.count({
      where: {
        userId: user.id,
        createdAt: MoreThan(windowStart),
      },
    });

    if (countInWindow >= this.cfg.maxPerWindow) {
      return genericResponse;
    }

    // Invalida tokens anteriores (one-active-token)
    await this.resetRepo.update(
      { userId: user.id, usedAt: IsNull() },
      { usedAt: new Date() },
    );

    const rawToken = this.toBase64Url(crypto.randomBytes(this.cfg.tokenBytes));
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + this.cfg.expiresInMs);

    await this.resetRepo.save({
      userId: user.id,
      tokenHash,
      expiresAt,
      usedAt: null,
      requestIp: params.requestIp ?? null,
      userAgent: params.userAgent ?? null,
    });

    const resetLink = this.buildResetLink(rawToken);
    const expiresMinutes = Math.max(
      1,
      Math.floor(this.cfg.expiresInMs / 60000),
    );

    // Envía email
    await this.mailer.sendResetPasswordEmail({
      to: user.email,
      resetLink,
      expiresMinutes,
      appName: 'App',
    });

    return genericResponse;
  }

  async validateResetToken(token: string) {
    const tokenHash = this.hashToken(token);
    const now = new Date();

    const record = await this.resetRepo.findOne({
      where: {
        tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(now),
      },
    });

    return { valid: !!record };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);

    return this.dataSource.transaction(async (manager) => {
      const tokenRepo = manager.getRepository(PasswordResetToken);
      const userRepo = manager.getRepository(User);

      const now = new Date();

      const record = await tokenRepo.findOne({
        where: {
          tokenHash,
          usedAt: IsNull(),
          expiresAt: MoreThan(now),
        },
      });

      if (!record) {
        throw new BadRequestException('Token inválido o expirado');
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await userRepo.update(
        { id: record.userId },
        { password: passwordHash, passwordChangedAt: now },
      );

      await tokenRepo.update({ id: record.id }, { usedAt: now });

      return { message: 'Contraseña actualizada correctamente' };
    });
  }
}
