import { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async goto(params?: Record<string, string>): Promise<void> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    await this.page.goto(this.path + query);
    await this.waitForPageReady();
  }

  protected async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  protected async safeClick(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
  }

  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }
}
