import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import { Payload } from '../models/payload.model';
import authConfig from '../../config/auth/auth.config';
import { UsersService } from '../../../application/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly usersService: UsersService, // ✅ nuevo
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload: Payload) {
    // 1) traer user para leer passwordChangedAt
    const user = await this.usersService.getUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    // 2) si el usuario cambió contraseña después de que se emitió el token, invalidar
    if (user.passwordChangedAt && payload.iat) {
      const tokenIssuedAtMs = payload.iat * 1000; // iat viene en segundos
      if (tokenIssuedAtMs < user.passwordChangedAt.getTime()) {
        throw new UnauthorizedException('Token revoked');
      }
    }

    return payload;
  }
}
