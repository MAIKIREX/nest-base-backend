export interface Payload {
  sub: string;
  role: string;
  iat?: number; // ✅ importante
  exp?: number;
}
