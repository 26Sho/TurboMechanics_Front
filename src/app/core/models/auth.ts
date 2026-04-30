export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  jwt: string;
  rolId: number;
}

export interface RegisterRequest {
  username: string;
  identification: number;
  phone: string;
  email: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

export interface RefreshTokenResponse {
  message: string;
  jwt: string;
}

export interface JwtPayload {
  userId: number;
  rolId: number;
  sub: string;
  iat: number;
  exp: number;
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  emailOrPhone: string;
}

export interface ValidateResetTokenRequest {
  emailOrPhone: string; // ← agregado
  code: string;         // ← era "token"
}

export interface ResetPasswordRequest {
  emailOrPhone: string; // ← agregado
  code: string;         // ← era "token"
  newPassword: string;
}