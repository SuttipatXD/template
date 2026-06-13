import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly path = '/login';

  // --- Static locators (defined once, evaluated lazily by Playwright) ---
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorBanner: Locator;
  readonly forgotPasswordLink: Locator;
  readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email address');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorBanner = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.rememberMeCheckbox = page.getByLabel('Remember me');
  }

  // --- Actions ---
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.safeClick(this.submitButton);
  }

  async loginAndWaitForDashboard(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.page.waitForURL('**/dashboard');
  }
}
