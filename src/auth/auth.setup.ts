import { test as setup } from '../fixtures';
import { AuthHelper } from '../helpers/auth.helper';
import { TEST_USERS } from '../data/users';

/**
 * Global auth setup — runs once per browser project before any test.
 * Saves storageState (cookies + localStorage) to playwright/.auth/user.json
 * so all test workers can reuse the authenticated session without re-logging in.
 *
 * Matched by playwright.config.ts: testMatch: /.*\.setup\.ts/
 */
setup('authenticate as standard user', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.loginAndWaitForDashboard(
    TEST_USERS.standard.email,
    TEST_USERS.standard.password,
  );

  await AuthHelper.saveState(page.context());
});
