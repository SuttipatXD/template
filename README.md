# Playwright TypeScript Template

Template มาตรฐานสำหรับ Playwright + TypeScript ออกแบบมาเพื่อลด flaky test และง่ายต่อการดูแลในระยะยาว

---

## Features

- **Page Object Model** — locator รวมอยู่ในคลาสละหน้า แก้ที่เดียวมีผลทุก test
- **Auto-block analytics** — fixture block Google Analytics, GTM, Facebook Pixel และ tracking scripts อื่นๆ อัตโนมัติทุก test โดยไม่ต้องเขียนเพิ่ม
- **Authentication reuse** — login ครั้งเดียวต่อ browser project ด้วย `storageState`
- **Single import point** — `import { test, expect } from '../../src/fixtures'` แทน `@playwright/test`
- **TypeScript strict mode** — type-safe ตั้งแต่ต้น พร้อม path aliases
- **Multi-browser** — Chromium, Firefox, WebKit, Pixel 5, iPhone 13
- **CI/CD ready** — GitHub Actions สำหรับ PR และ nightly regression
- **Dual reporting** — HTML report + Allure

---

## Project Structure

```
template/
├── .github/workflows/
│   ├── playwright.yml       # รัน test ทุก push/PR ไป main
│   └── scheduled.yml        # Nightly regression ทุกคืน 08:00 (Bangkok)
│
├── src/
│   ├── auth/
│   │   └── auth.setup.ts    # Login 1 ครั้ง → บันทึก session ให้ทุก worker ใช้ร่วม
│   ├── data/
│   │   ├── constants.ts     # TIMEOUTS, ROUTES, MESSAGES
│   │   └── users.ts         # Test users (อ่านจาก .env)
│   ├── fixtures/
│   │   ├── index.ts         # ★ import ทุก test มาจากที่นี่
│   │   └── networkBlockList.ts  # URL patterns ที่ถูก abort อัตโนมัติ
│   ├── helpers/
│   │   ├── api.helper.ts    # HTTP wrappers (get/post/put/patch/delete)
│   │   ├── auth.helper.ts   # storageState utilities
│   │   └── random.helper.ts # Test data generator
│   ├── pages/
│   │   ├── BasePage.ts      # Abstract base: goto, safeClick, waitForPageReady
│   │   ├── LoginPage.ts     # ตัวอย่าง POM
│   │   ├── DashboardPage.ts # ตัวอย่าง POM + component composition
│   │   └── components/
│   │       ├── NavbarComponent.ts
│   │       └── TableComponent.ts
│   └── types/
│       └── index.ts         # Shared TypeScript interfaces
│
├── tests/
│   ├── smoke/               # @smoke — critical path, รันทุก PR
│   ├── regression/          # @regression — full coverage, รัน nightly
│   └── api/                 # API tests ไม่ต้องการ browser
│
├── playwright/.auth/        # storageState files (gitignored)
├── playwright.config.ts
├── tsconfig.json
├── .env.example
└── TODO.md                  # Implementation checklist สำหรับโปรเจกต์จริง
```

---

## Quick Start

### 1. ติดตั้ง Dependencies

```bash
npm install
npx playwright install chromium firefox webkit
```

### 2. ตั้งค่า Environment

```bash
cp .env.example .env
```

แก้ไขค่าใน `.env`:

```env
BASE_URL=https://your-app.example.com
API_BASE_URL=https://your-app.example.com/api
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=yourpassword
```

### 3. รัน Tests

```bash
npm test                  # ทุก test ทุก browser
npm run test:smoke        # เฉพาะ @smoke (เร็ว ~2 นาที)
npm run test:headed       # ดู browser ขณะรัน
npm run test:ui           # Playwright UI mode (interactive)
```

---

## Commands

```bash
# Testing
npm test                          # ทุก test
npm run test:smoke                # @smoke tag
npm run test:regression           # @regression tag
npm run test:api                  # API tests เท่านั้น
npm run test:chromium             # Chromium เท่านั้น
npm run test:headed               # แสดง browser window
npm run test:debug                # Debug แบบ step-by-step
npm run test:ui                   # Playwright UI mode

# Reports
npm run report:html               # เปิด HTML report
npm run report:allure:generate    # สร้าง Allure report
npm run report:allure             # เปิด Allure report

# Development
npm run codegen                   # บันทึก interaction เพื่อ generate locators
npm run type-check                # ตรวจ TypeScript types
```

---

## Core Concepts

### Page Object Model

Locator ทุกตัวนิยามใน constructor เป็น `readonly` property — แก้ที่เดียว ทุก test ได้รับผลทันที:

```typescript
// src/pages/LoginPage.ts
export class LoginPage extends BasePage {
  readonly path = '/login';

  // Static locator → readonly property
  readonly emailInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput   = page.getByLabel('Email address');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
  }

  // Dynamic locator (มี parameter) → method คืน Locator
  rowByName(name: string): Locator {
    return this.page.getByRole('row', { name });
  }

  // Action method — ไม่มี assertion
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.safeClick(this.submitButton);
  }
}
```

### Fixtures & Network Blocking

`src/fixtures/index.ts` override built-in `page` fixture เพื่อ block analytics ก่อน navigation ทุก test:

```typescript
// tests/smoke/login.spec.ts
import { test, expect } from '../../src/fixtures';  // ← import จากที่นี่เสมอ

test('login succeeds', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login('user@example.com', 'pass');
  await expect(loginPage.errorBanner).not.toBeVisible();
  // analytics ถูก block อัตโนมัติ — ไม่ต้องเขียนเพิ่ม
});
```

### Adding a New Page

```typescript
// 1. สร้าง src/pages/ProductPage.ts
export class ProductPage extends BasePage {
  readonly path = '/products';
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder('Search products');
  }

  productCard(name: string): Locator {
    return this.page.getByTestId('product-card').filter({ hasText: name });
  }
}

// 2. เพิ่มใน src/fixtures/index.ts
type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  productPage: ProductPage;  // ← เพิ่มตรงนี้
};

// และใน test.extend:
productPage: async ({ page }, use) => { await use(new ProductPage(page)); },

// 3. ใช้ใน test
test('search works', async ({ productPage }) => {
  await productPage.goto();
  await productPage.searchInput.fill('Widget');
});
```

---

## Configuration

### Timeouts

| Level | ค่า | Key |
|---|---|---|
| Per test | 30s | `timeout` |
| Per assertion | 5s | `expect.timeout` |
| Per action | 10s | `actionTimeout` |
| Per navigation | 15s | `navigationTimeout` |
| CI retries | 2 | `retries` |

### Browser Projects

`playwright.config.ts` มี 5 projects พร้อม:

| Project | Device |
|---|---|
| chromium | Desktop Chrome |
| firefox | Desktop Firefox |
| webkit | Desktop Safari |
| mobile-chrome | Pixel 5 |
| mobile-safari | iPhone 13 |

เพิ่ม/ลด project ได้ใน `playwright.config.ts` → `projects[]`

### Scripts ที่ถูก Block

ดูรายการเต็มได้ที่ [src/fixtures/networkBlockList.ts](src/fixtures/networkBlockList.ts):

- Google Analytics, GTM, Segment, Mixpanel, Amplitude, Heap
- Facebook Pixel, Doubleclick, LinkedIn Ads, Bing/Twitter pixel
- Hotjar, FullStory, Clarity, LogRocket, SmartLook
- Tealium, Adobe Launch

---

## CI/CD

### GitHub Actions Secrets ที่ต้องกำหนด

| Secret | คำอธิบาย |
|---|---|
| `BASE_URL` | URL ของ app ที่จะ test |
| `API_BASE_URL` | URL ของ API |
| `TEST_USER_EMAIL` | Email ของ test user |
| `TEST_USER_PASSWORD` | Password ของ test user |

### Workflows

- **`playwright.yml`** — รันทุก push ไป `main`/`develop` และ PR → `main`
- **`scheduled.yml`** — รัน `@regression` ทุกคืน 08:00 (Bangkok) หรือ trigger ด้วยมือได้

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev) | Test runner + browser automation |
| TypeScript | Type safety |
| [Allure](https://allurereport.org) | Rich test reporting |
| dotenv | Environment configuration |
| Node.js 20 LTS | Runtime |

---

## Key Files

| ไฟล์ | หน้าที่ |
|---|---|
| [src/fixtures/index.ts](src/fixtures/index.ts) | Import `test` + `expect` จากที่นี่ทุก spec |
| [src/fixtures/networkBlockList.ts](src/fixtures/networkBlockList.ts) | เพิ่ม/ลด URL ที่ต้อง block |
| [src/pages/BasePage.ts](src/pages/BasePage.ts) | Base class สำหรับ Page ทุกหน้า |
| [src/auth/auth.setup.ts](src/auth/auth.setup.ts) | แก้ login flow ให้ตรงกับ app จริง |
| [playwright.config.ts](playwright.config.ts) | Projects, timeouts, reporters |
| [TODO.md](TODO.md) | Checklist สำหรับนำ template ไปใช้งาน |
