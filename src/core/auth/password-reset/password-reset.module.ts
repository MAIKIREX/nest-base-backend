import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import passwordResetConfig from '../../config/auth/password-reset.config';
import { UsersModule } from '../../../application/users/users.module';
import { MailerModule } from '../../mailer/mailer.module';

import { PasswordResetToken } from './entities/password-reset-token.entity';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';

@Module({
  imports: [
    UsersModule,
    MailerModule,
    ConfigModule.forFeature(passwordResetConfig),
    TypeOrmModule.forFeature([PasswordResetToken]),
  ],
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
})
export class PasswordResetModule {}
