import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';
import { NavbarComponent } from './components/NavbarComponent';

export class DashboardPage extends BasePage {
  readonly path = '/dashboard';

  // --- Static locators ---
  readonly pageTitle: Locator;
  readonly welcomeMessage: Locator;
  readonly createButton: Locator;

  // --- Reusable components ---
  readonly navbar: NavbarComponent;
  readonly dataTable: TableComponent;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.welcomeMessage = page.getByTestId('welcome-message');
    this.createButton = page.getByRole('button', { name: 'Create' });

    this.navbar = new NavbarComponent(page);
    this.dataTable = new TableComponent(page.getByTestId('data-table'));
  }

  // --- Dynamic locators (parameterized → returned as Locator) ---
  statCard(label: string): Locator {
    return this.page.getByTestId('stat-card').filter({ hasText: label });
  }

  statValue(label: string): Locator {
    return this.statCard(label).getByTestId('stat-value');
  }

  // --- Actions ---
  async clickCreate(): Promise<void> {
    await this.safeClick(this.createButton);
  }
}
