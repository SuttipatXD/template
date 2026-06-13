import { BrowserContext, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_DIR = path.join(process.cwd(), 'playwright', '.auth');

export class AuthHelper {
  static storagePath(name = 'user'): string {
    return path.join(AUTH_DIR, `${name}.json`);
  }

  /** Save the current browser context auth state to disk. */
  static async saveState(context: BrowserContext, name = 'user'): Promise<void> {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }
    await context.storageState({ path: AuthHelper.storagePath(name) });
  }

  /** Check whether a saved auth state file exists and is non-empty. */
  static hasState(name = 'user'): boolean {
    const filePath = AuthHelper.storagePath(name);
    if (!fs.existsSync(filePath)) return false;
    const stat = fs.statSync(filePath);
    return stat.size > 10;
  }

  /** Inject an Authorization header on all requests via page route. */
  static async injectBearerToken(page: Page, token: string): Promise<void> {
    await page.route('**/*', async (route) => {
      const headers = { ...route.request().headers(), Authorization: `Bearer ${token}` };
      await route.continue({ headers });
    });
  }
}
