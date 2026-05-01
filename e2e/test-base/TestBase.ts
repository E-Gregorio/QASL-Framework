import { test as base, BrowserContext, Browser } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';
import * as path from 'path';
import * as fs from 'fs';

type QASLFixtures = {
  baseUrl: string;
  signupPage: SignupPage;
};

const HAR_OUTPUT_DIR = path.join(process.cwd(), '.api-captures');
const DEFAULT_BASE_URL = 'https://automationexercise.com';

function shouldRecordHar(): boolean {
  return (process.env.RECORD_HAR ?? 'false').toLowerCase() === 'true';
}

function harFileFor(testTitle: string): string {
  fs.mkdirSync(HAR_OUTPUT_DIR, { recursive: true });
  const safe = testTitle.replace(/[^A-Za-z0-9_-]+/g, '_');
  return path.join(HAR_OUTPUT_DIR, `${safe}.har`);
}

async function buildContext(browser: Browser, testTitle: string): Promise<BrowserContext> {
  if (shouldRecordHar()) {
    return browser.newContext({
      recordHar: { path: harFileFor(testTitle), mode: 'minimal' },
    });
  }
  return browser.newContext();
}

export const test = base.extend<QASLFixtures>({
  context: async ({ browser }, use, testInfo) => {
    const ctx = await buildContext(browser, testInfo.titlePath.join('_'));
    await use(ctx);
    await ctx.close();
  },
  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  },
  baseUrl: async ({}, use) => {
    await use(process.env.BASE_URL ?? DEFAULT_BASE_URL);
  },
  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },
});

export { expect } from '@playwright/test';
