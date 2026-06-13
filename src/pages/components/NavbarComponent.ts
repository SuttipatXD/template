import { Locator, Page } from '@playwright/test';

export class NavbarComponent {
  private readonly root: Locator;

  readonly userMenuButton: Locator;
  readonly logoLink: Locator;
  readonly notificationBell: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('navigation');
    this.userMenuButton = this.root.getByTestId('user-menu');
    this.logoLink = this.root.getByRole('link', { name: 'Home' });
    this.notificationBell = this.root.getByRole('button', { name: 'Notifications' });
  }

  // --- Dynamic locators ---
  navLink(name: string): Locator {
    return this.root.getByRole('link', { name });
  }

  dropdownItem(name: string): Locator {
    return this.root.getByRole('menuitem', { name });
  }

  // --- Actions ---
  async navigateTo(linkName: string): Promise<void> {
    await this.navLink(linkName).click();
  }

  async openUserMenu(): Promise<void> {
    await this.userMenuButton.click();
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.dropdownItem('Sign out').click();
  }
}
