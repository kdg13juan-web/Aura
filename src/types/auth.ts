export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'google';
  createdAt: string;
  lastLoginAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthError {
  field?: 'email' | 'password' | 'confirmPassword' | 'name' | 'general';
  message: string;
  code?: string;
}

export interface GoogleAccount {
  id?: string;
  email: string;
  name: string;
  avatar: string;
}
