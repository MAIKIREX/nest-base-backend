import { registerAs } from '@nestjs/config';

const toInt = (v: string | undefined, def: number) =>
  v !== undefined && v !== '' ? parseInt(v, 10) : def;

export interface PasswordResetConfig {
  frontendPublicUrl: string;
  frontendResetPath: string;
  pepper: string;
  expiresInMs: number;
  tokenBytes: number;

  // ✅ rate limit
  cooldownMs: number;
  windowMs: number;
  maxPerWindow: number;
}

export default registerAs('passwordReset', (): PasswordResetConfig => ({
  frontendPublicUrl: process.env.FRONTEND_PUBLIC_URL ?? '',
  frontendResetPath: process.env.RESET_PASSWORD_FRONTEND_PATH ?? '/auth/update-password',
  pepper: process.env.RESET_TOKEN_PEPPER ?? 'change_me_in_prod',
  expiresInMs: toInt(process.env.RESET_TOKEN_EXPIRES_IN_MS, 3600000),
  tokenBytes: toInt(process.env.RESET_TOKEN_BYTES, 32),

  // ✅ rate limit
  cooldownMs: toInt(process.env.RESET_RATE_LIMIT_COOLDOWN_MS, 120000),
  windowMs: toInt(process.env.RESET_RATE_LIMIT_WINDOW_MS, 3600000),
  maxPerWindow: toInt(process.env.RESET_RATE_LIMIT_MAX_PER_WINDOW, 5),
}));

