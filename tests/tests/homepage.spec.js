import { test } from '@playwright/test';

test('Homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  console.log(await page.title());
});