import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { BLOCKED_PATTERNS } from './networkBlockList';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

/**
 * Extended test with:
 *  1. Auto-blocking of analytics/tracking scripts on every test (via page override)
 *  2. Lazy page-object fixtures — only instantiated when a test requests them
 *
 * All tests MUST import { test, expect } from here, NOT from '@playwright/test'.
 * This guarantees blocking is active and page objects are available everywhere.
 */
export const test = base.extend<PageFixtures>({
  // Override the built-in `page` fixture to inject network blocking before
  // any navigation. Using page-scope means each test gets a clean block list.
  page: async ({ page }, use) => {
    await page.route(
      (url) =>
        BLOCKED_PATTERNS.some((pattern) =>
          typeof pattern === 'string'
            ? url.href.includes(pattern)
            : pattern.test(url.href),
        ),
      (route) => route.abort(),
    );
    await use(page);
  },

  // --- Lazy page-object fixtures ---
  // Playwright only instantiates these when the test function destructures them.
  // Tests that don't need loginPage pay zero cost.
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect };
