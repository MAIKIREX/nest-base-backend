import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { PasswordResetService } from './password-reset.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ValidateResetTokenDto } from './dto/validate-reset-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
@ApiTags('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña (correo)' })
  @ApiOkResponse({ description: 'Respuesta genérica (anti-enumeración)' })
  forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    return this.passwordResetService.requestPasswordReset({
      email: dto.email,
      requestIp: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
  }

  @Post('reset-password/validate')
  @ApiOperation({ summary: 'Validar token de restablecimiento' })
  @ApiOkResponse({ description: 'Retorna si el token es válido' })
  validateToken(@Body() dto: ValidateResetTokenDto) {
    return this.passwordResetService.validateResetToken(dto.token);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña usando token válido' })
  @ApiOkResponse({ description: 'Contraseña actualizada' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(dto.token, dto.newPassword);
  }
}
