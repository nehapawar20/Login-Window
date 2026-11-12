export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData extends LoginFormData {
  name: string;
  confirmPassword: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export interface UserSession {
  email: string;
  name?: string;
  token: string;
  loggedInAt: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  registeredAt: string;
}

export type AuthMode = 'login' | 'register' | 'forgot-password';

