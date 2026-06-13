import type { User } from '../types';

export const TEST_USERS = {
  standard: {
    email: process.env['TEST_USER_EMAIL'] ?? 'user@example.com',
    password: process.env['TEST_USER_PASSWORD'] ?? 'password',
    name: 'Test User',
    role: 'editor' as const,
  } satisfies User,

  admin: {
    email: process.env['TEST_ADMIN_EMAIL'] ?? 'admin@example.com',
    password: process.env['TEST_ADMIN_PASSWORD'] ?? 'adminpassword',
    name: 'Admin User',
    role: 'admin' as const,
  } satisfies User,
} as const;
