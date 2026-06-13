import { test, expect } from '../../src/fixtures';
import { TEST_USERS } from '../../src/data/users';
import { MESSAGES, ROUTES } from '../../src/data/constants';

test.describe('Login @smoke', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should login successfully with valid credentials', async ({ loginPage, page }) => {
    await loginPage.login(TEST_USERS.standard.email, TEST_USERS.standard.password);

    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
  });

  test('should show error with invalid password', async ({ loginPage }) => {
    await loginPage.login(TEST_USERS.standard.email, 'wrong-password');

    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toContainText(MESSAGES.loginFailed);
  });

  test('should show error with unregistered email', async ({ loginPage }) => {
    await loginPage.login('nobody@example.com', 'anypassword');

    await expect(loginPage.errorBanner).toBeVisible();
  });

  test('submit button should be disabled when fields are empty', async ({ loginPage }) => {
    await expect(loginPage.submitButton).toBeDisabled();
  });

  test('forgot password link should be visible', async ({ loginPage }) => {
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });
});
