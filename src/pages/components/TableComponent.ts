import { Locator } from '@playwright/test';

/**
 * Reusable table component.
 * Accepts any Locator as root — compose it into page objects via constructor injection.
 *
 * Usage in a page:
 *   this.usersTable = new TableComponent(page.getByTestId('users-table'));
 */
export class TableComponent {
  constructor(private readonly root: Locator) {}

  get headers(): Locator {
    return this.root.getByRole('columnheader');
  }

  get rows(): Locator {
    return this.root.getByRole('row').filter({ hasNot: this.root.getByRole('columnheader') });
  }

  get loadingSpinner(): Locator {
    return this.root.getByRole('progressbar');
  }

  // --- Dynamic locators ---
  rowByText(text: string): Locator {
    return this.rows.filter({ hasText: text });
  }

  cellInRow(rowText: string, columnIndex: number): Locator {
    return this.rowByText(rowText).getByRole('cell').nth(columnIndex);
  }

  actionButtonInRow(rowText: string, actionName: string): Locator {
    return this.rowByText(rowText).getByRole('button', { name: actionName });
  }

  checkboxInRow(rowText: string): Locator {
    return this.rowByText(rowText).getByRole('checkbox');
  }
}
