# Playwright TypeScript Template — TODO & Design Reference

> Template พร้อมใช้สำหรับ Playwright + TypeScript ด้วย Page Object Model และ Smart Fixtures
> เหมาะสำหรับโปรเจกต์ขนาดกลาง-ใหญ่ที่ต้องการมาตรฐานและลด flaky test

---

## Project Structure

```
template/
├── .github/
│   └── workflows/
│       ├── playwright.yml          # CI: รัน test ทุก push/PR ไปยัง main
│       └── scheduled.yml           # Nightly: รัน @regression ทุกคืน 08:00 (Bangkok)
│
├── src/
│   ├── auth/
│   │   └── auth.setup.ts           # Global auth setup — รัน 1 ครั้งก่อน test ทั้งหมด
│   │
│   ├── data/
│   │   ├── constants.ts            # TIMEOUTS, ROUTES, MESSAGES ที่ใช้ร่วมกัน
│   │   └── users.ts                # Test user definitions (อ่านจาก .env อัตโนมัติ)
│   │
│   ├── fixtures/
│   │   ├── index.ts                # ★ SINGLE import point — test + expect + page fixtures
│   │   └── networkBlockList.ts     # รายการ URL analytics/tracking ที่ต้อง block
│   │
│   ├── helpers/
│   │   ├── api.helper.ts           # APIRequestContext wrappers (get/post/put/patch/delete)
│   │   ├── auth.helper.ts          # storageState save/load, bearer token injection
│   │   └── random.helper.ts        # Test data generator (email, name, id, date)
│   │
│   ├── pages/
│   │   ├── BasePage.ts             # Abstract base: goto, waitForPageReady, safeClick
│   │   ├── LoginPage.ts            # POM example — readonly Locator properties
│   │   ├── DashboardPage.ts        # POM example — component composition
│   │   └── components/
│   │       ├── NavbarComponent.ts  # Reusable navigation bar
│   │       └── TableComponent.ts   # Reusable data table
│   │
│   └── types/
│       └── index.ts                # Shared TypeScript interfaces (User, ApiResponse, etc.)
│
├── tests/
│   ├── smoke/
│   │   └── login.spec.ts           # @smoke — critical path, รันใน CI ทุก PR
│   ├── regression/
│   │   └── dashboard.spec.ts       # @regression — full coverage, รัน nightly
│   └── api/
│       └── users.api.spec.ts       # API tests — headless, เร็วมาก
│
├── playwright/.auth/
│   └── .gitkeep                    # storageState ถูก gitignore ไว้ สร้างโดย auth.setup.ts
│
├── .env.example                    # Template — copy เป็น .env แล้วใส่ค่าจริง
├── .gitignore
├── playwright.config.ts            # Projects, baseURL, timeouts, reporters
├── tsconfig.json                   # strict + path aliases
└── TODO.md                         # ← ไฟล์นี้
```

---

## Design Decisions

### 1. Page Object Model — Locator Strategy

แต่ละหน้ามี class ของตัวเอง extend จาก `BasePage` โดย locator เป็น `readonly` property
ที่กำหนดใน constructor ทำให้แก้ที่เดียวมีผลทุก test:

```typescript
// src/pages/LoginPage.ts
export class LoginPage extends BasePage {
  readonly path = '/login';

  // ✅ Static locators — readonly, กำหนดครั้งเดียวใน constructor
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput   = page.getByLabel('Email address');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton  = page.getByRole('button', { name: 'Sign in' });
  }

  // ✅ Dynamic locators — method คืน Locator (มี parameter)
  // rowByName(name: string): Locator { return ... }

  // ✅ Actions only — assertion ไม่มีใน Page class
  async login(email: string, password: string): Promise<void> { ... }
}
```

| Locator ประเภท | Pattern | ตัวอย่าง |
|---|---|---|
| Static (ไม่มี param) | `readonly` property | `readonly submitButton: Locator` |
| Dynamic (มี param) | method return Locator | `rowByName(name: string): Locator` |
| Reusable component | class injection | `this.dataTable = new TableComponent(...)` |

---

### 2. Fixtures — Auto-Block Network

`src/fixtures/index.ts` override built-in `page` fixture เพื่อ intercept request ก่อน
navigation ทุก test อัตโนมัติ ไม่ต้อง setup ในแต่ละ spec:

```typescript
// src/fixtures/index.ts
export const test = base.extend<PageFixtures>({
  page: async ({ page }, use) => {
    // Block analytics/tracking ก่อน test รัน
    await page.route(
      (url) => BLOCKED_PATTERNS.some(p =>
        typeof p === 'string' ? url.href.includes(p) : p.test(url.href)
      ),
      (route) => route.abort(),
    );
    await use(page);
  },

  // Lazy fixtures — instantiate เฉพาะเมื่อ test ขอ
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  dashboardPage: async ({ page }, use) => { await use(new DashboardPage(page)); },
});

export { expect }; // Re-export เพื่อให้ tests import จากที่เดียว
```

**กฎเหล็ก:** Tests ทุกไฟล์ต้อง import จาก `../../src/fixtures` เท่านั้น — ห้าม `@playwright/test` โดยตรง

**Scripts ที่ถูก block** (ดู `src/fixtures/networkBlockList.ts`):
- Google Analytics, GTM
- Facebook Pixel, Doubleclick
- Hotjar, FullStory, Clarity, LogRocket
- Segment, Mixpanel, Amplitude, Heap
- LinkedIn Ads, Twitter/X pixel, Bing pixel
- Tealium, Adobe Launch

---

### 3. Authentication Reuse (storageState)

```
auth.setup.ts  →  login 1 ครั้ง  →  บันทึก playwright/.auth/user.json
                                         ↓
                              browser projects ทั้งหมด reuse state นี้
                              (ไม่ต้อง login ซ้ำในทุก test)
```

ลำดับการรัน: `setup` project → `chromium` / `firefox` / `webkit` / mobile projects

---

### 4. Path Aliases (tsconfig.json)

```
@pages/*       →  src/pages/*
@fixtures      →  src/fixtures/index.ts
@helpers/*     →  src/helpers/*
@data/*        →  src/data/*
@app-types/*   →  src/types/*
```

Playwright 1.46+ รองรับ path alias ผ่าน esbuild bundler ในตัว ไม่ต้องติดตั้ง package เพิ่ม

---

### 5. Timeout Strategy

| Level | Value | Config key |
|---|---|---|
| Per test | 30s | `timeout` |
| Per assertion | 5s | `expect.timeout` |
| Per action (click/fill) | 10s | `actionTimeout` |
| Per navigation | 15s | `navigationTimeout` |
| CI retries | 2 | `retries` |
| Local retries | 0 | `retries` |

---

## Environment Setup

```bash
# 1. Copy environment template
cp .env.example .env

# 2. แก้ไขค่าใน .env
BASE_URL=https://your-app.example.com
API_BASE_URL=https://your-app.example.com/api
TEST_USER_EMAIL=your-test@example.com
TEST_USER_PASSWORD=yourpassword
```

---

## Template Setup Status

สิ่งที่ **สร้างเสร็จแล้ว** ใน template นี้:

### ✅ Phase 0 — Template พร้อมใช้แล้ว

- [x] Scaffold — `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`
- [x] `playwright.config.ts` — 5 browser projects, timeouts, allure + html reporters
- [x] `src/pages/BasePage.ts` — abstract base class
- [x] `src/fixtures/networkBlockList.ts` — ~25 analytics/tracking patterns
- [x] `src/fixtures/index.ts` — auto-block + lazy page fixtures + re-export `expect`
- [x] `src/pages/LoginPage.ts` — ตัวอย่าง POM (readonly locators)
- [x] `src/pages/DashboardPage.ts` — ตัวอย่าง POM (component composition)
- [x] `src/pages/components/TableComponent.ts`
- [x] `src/pages/components/NavbarComponent.ts`
- [x] `src/helpers/api.helper.ts`
- [x] `src/helpers/auth.helper.ts`
- [x] `src/helpers/random.helper.ts`
- [x] `src/data/users.ts` + `src/data/constants.ts`
- [x] `src/types/index.ts`
- [x] `src/auth/auth.setup.ts` — global storageState setup
- [x] `playwright/.auth/.gitkeep`
- [x] `tests/smoke/login.spec.ts` — ตัวอย่าง smoke test
- [x] `tests/regression/dashboard.spec.ts` — ตัวอย่าง regression test
- [x] `tests/api/users.api.spec.ts` — ตัวอย่าง API test
- [x] `.github/workflows/playwright.yml` — CI pipeline
- [x] `.github/workflows/scheduled.yml` — nightly regression
- [x] `README.md`
- [x] `npm run type-check` — ผ่านสะอาด ✓

---

## Implementation Checklist

ทำตามลำดับนี้เมื่อนำ template ไปใช้กับโปรเจกต์จริง:

### Phase 1 — ปรับ Config ให้ตรงกับ App จริง

- [ ] แก้ `BASE_URL` และ `API_BASE_URL` ใน `.env`
- [ ] แก้ `locale` และ `timezoneId` ใน `playwright.config.ts` ถ้าจำเป็น
- [ ] เพิ่ม/ลด browser projects ใน `playwright.config.ts` ตามที่ต้องการ test
- [ ] ตรวจสอบ `BLOCKED_PATTERNS` ใน `networkBlockList.ts` — uncomment chat widgets ถ้าไม่ test
- [ ] กำหนด GitHub Secrets: `BASE_URL`, `API_BASE_URL`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`

### Phase 2 — สร้าง Page Objects สำหรับ App จริง

- [ ] แก้ `src/pages/LoginPage.ts` ให้ตรงกับ locators ของ app (label, role, testid)
- [ ] แก้ `src/auth/auth.setup.ts` ให้ login ด้วย flow ของ app จริง
- [ ] สร้าง Page class ใหม่สำหรับแต่ละหน้าสำคัญ (extend BasePage)
  - [ ] กำหนด `readonly path` ให้ถูกต้อง
  - [ ] Locators ที่ไม่มี param → `readonly` property ใน constructor
  - [ ] Locators ที่มี param → method ที่คืน `Locator`
  - [ ] Actions เป็น `async` method — ห้ามมี assertion
- [ ] สร้าง Component class ถ้ามี UI ซ้ำหลายหน้า (เช่น Modal, Dropdown, Pagination)
- [ ] เพิ่ม page fixture ใน `src/fixtures/index.ts` สำหรับทุก Page ใหม่

### Phase 3 — เพิ่ม Test Data

- [ ] แก้ `src/data/users.ts` ให้ตรงกับ user roles ของ app
- [ ] เพิ่ม constants ที่จำเป็นใน `src/data/constants.ts` (routes, messages, regex)
- [ ] เพิ่ม types ใน `src/types/index.ts` สำหรับ domain objects ของ app

### Phase 4 — เขียน Tests

- [ ] **Smoke tests** (`tests/smoke/`) — tag ด้วย `@smoke`
  - [ ] login / logout flow
  - [ ] critical path ที่ต้องผ่านทุก deploy
- [ ] **Regression tests** (`tests/regression/`) — tag ด้วย `@regression`
  - [ ] แต่ละ feature มี spec file ของตัวเอง
  - [ ] ใช้ `test.describe()` จัดกลุ่ม
- [ ] **API tests** (`tests/api/`) — ไม่ต้องการ browser
  - [ ] CRUD endpoints หลัก
  - [ ] Error cases (400, 401, 404, 500)

### Phase 5 — Verify & Cleanup

- [ ] `npm run type-check` — ต้องผ่านโดยไม่มี TS error
- [ ] รัน smoke tests locally: `npm run test:smoke`
- [ ] ดู HTML report: `npm run report:html`
- [ ] Push แล้วดู CI pass ใน GitHub Actions
- [ ] ลบ example files ที่ไม่ใช้แล้ว (LoginPage, DashboardPage ถ้าสร้างของจริงแล้ว)

---

## Common Commands

```bash
# รัน tests
npm test                          # ทุก test ทุก browser
npm run test:smoke                # เฉพาะ @smoke tag
npm run test:regression           # เฉพาะ @regression tag
npm run test:chromium             # เฉพาะ Chromium
npm run test:headed               # ดู browser ขณะรัน
npm run test:debug                # Debug mode (step-by-step)
npm run test:ui                   # Playwright UI mode

# Reports
npm run report:html               # เปิด HTML report
npm run report:allure:generate    # สร้าง Allure report
npm run report:allure             # เปิด Allure report

# Development
npm run codegen                   # Record interactions เพื่อ generate locators
npm run type-check                # ตรวจ TypeScript types
```

---

## Adding a New Page (Quick Guide)

```bash
# 1. สร้างไฟล์ page
# src/pages/ProductPage.ts

# 2. สร้าง class
export class ProductPage extends BasePage {
  readonly path = '/products';
  readonly searchInput: Locator;  # static locator
  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder('Search products');
  }
  productCard(name: string): Locator {  # dynamic locator
    return this.page.getByTestId('product-card').filter({ hasText: name });
  }
}

# 3. เพิ่มใน src/fixtures/index.ts
productPage: async ({ page }, use) => { await use(new ProductPage(page)); },

# 4. เพิ่มใน type PageFixtures
productPage: ProductPage;

# 5. เขียน test
import { test, expect } from '../../src/fixtures';
test('product search', async ({ productPage }) => {
  await productPage.goto();
  await productPage.searchInput.fill('Widget');
  ...
});
```

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Playwright | latest | Test runner + browser automation |
| TypeScript | latest | Type safety |
| Allure Playwright | latest | Rich test reporting |
| dotenv | latest | Environment configuration |
| Node.js | 20 LTS | Runtime |

---

## Key Files Reference

| ไฟล์ | หน้าที่ |
|---|---|
| [src/fixtures/index.ts](src/fixtures/index.ts) | Import จากที่นี่ที่เดียวในทุก test |
| [src/fixtures/networkBlockList.ts](src/fixtures/networkBlockList.ts) | เพิ่ม/ลด URL ที่ต้อง block |
| [src/pages/BasePage.ts](src/pages/BasePage.ts) | Base class สำหรับ Page ทุกหน้า |
| [src/auth/auth.setup.ts](src/auth/auth.setup.ts) | แก้ login flow ให้ตรงกับ app |
| [playwright.config.ts](playwright.config.ts) | Timeouts, browsers, reporters |
| [.env.example](.env.example) | Template environment variables |
