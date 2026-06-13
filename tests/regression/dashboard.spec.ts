import { test, expect } from '../../src/fixtures';

/**
 * Dashboard regression tests.
 * The setup project handles authentication; these tests run with a pre-authenticated session.
 */
test.describe('Dashboard @regression', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test('should display page title', async ({ dashboardPage }) => {
    await expect(dashboardPage.pageTitle).toBeVisible();
  });

  test('should display welcome message', async ({ dashboardPage }) => {
    await expect(dashboardPage.welcomeMessage).toBeVisible();
  });

  test('should display the data table', async ({ dashboardPage }) => {
    await expect(dashboardPage.dataTable.rows).not.toHaveCount(0);
  });

  test('navigation links should be present', async ({ dashboardPage }) => {
    await expect(dashboardPage.navbar.navLink('Dashboard')).toBeVisible();
    await expect(dashboardPage.navbar.navLink('Settings')).toBeVisible();
  });

  test('create button should be visible and enabled', async ({ dashboardPage }) => {
    await expect(dashboardPage.createButton).toBeVisible();
    await expect(dashboardPage.createButton).toBeEnabled();
  });

  test('table row action button should be clickable', async ({ dashboardPage }) => {
    const firstRowText = await dashboardPage.dataTable.rows.first().innerText();
    const editButton = dashboardPage.dataTable.actionButtonInRow(firstRowText, 'Edit');
    await expect(editButton).toBeVisible();
  });
});
