// --- User ---
export interface User {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

// --- API ---
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

// --- Environment ---
export interface TestConfig {
  baseUrl: string;
  apiBaseUrl: string;
}
