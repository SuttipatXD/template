export const TIMEOUTS = {
  short: 5_000,
  medium: 10_000,
  long: 30_000,
  navigation: 15_000,
} as const;

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  profile: '/profile',
  settings: '/settings',
} as const;

export const MESSAGES = {
  loginSuccess: 'Welcome back',
  loginFailed: 'Invalid email or password',
  sessionExpired: 'Your session has expired',
} as const;
