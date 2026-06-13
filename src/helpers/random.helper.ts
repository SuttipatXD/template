import * as crypto from 'crypto';

/** Lightweight test data generator — no external dependencies. */
export const random = {
  /** e.g. "user_a3f9b2@test.com" */
  email(prefix = 'user'): string {
    return `${prefix}_${this.id(6)}@test.com`;
  },

  /** Alphanumeric string of given length. */
  id(length = 8): string {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  },

  /** e.g. "Test User 7c2d" */
  name(prefix = 'Test User'): string {
    return `${prefix} ${this.id(4)}`;
  },

  /** Integer between min and max (inclusive). */
  int(min = 0, max = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /** Pick a random element from an array. */
  pick<T>(arr: T[]): T {
    const item = arr[Math.floor(Math.random() * arr.length)];
    if (item === undefined) throw new Error('Cannot pick from an empty array');
    return item;
  },

  /** ISO timestamp offset by days from now. */
  date(offsetDays = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString();
  },
};
