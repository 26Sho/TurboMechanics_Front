export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  jwt: string;
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
  sub: string; // normalmente es el email
  iat: number;
  exp: number;
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}
 
export interface ValidateResetTokenRequest {
  token: string;
}
 
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}