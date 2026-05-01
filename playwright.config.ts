import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e/specs',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: 1,
    reporter: [
        ['html', { outputFolder: 'reports/e2e/html-report', open: 'never' }],
        ['json', { outputFile: 'reports/e2e/results.json' }],
        ['allure-playwright', {
            outputFolder: 'reports/e2e/allure-results',
            detail: true,
            suiteTitle: true,
            environmentInfo: {
                framework: 'Playwright',
                node_version: process.version,
            }
        }],
        ['list']
    ],
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        headless: false,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    outputDir: 'reports/test-results',
});
