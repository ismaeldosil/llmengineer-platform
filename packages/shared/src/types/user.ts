export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}
