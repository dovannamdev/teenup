import { test, expect } from '@playwright/test';

test.describe('TeenUp LMS Full E2E Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Go to frontend URL (started by docker-compose at port 3000)
    await page.goto('http://localhost:3000/');
  });

  test('should load the main application and tabs', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/TeenUp LMS/);
    await expect(page.locator('h1')).toContainText('TeenUp LMS');

    // Check all tabs exist
    const tabs = ['Parents & Students', 'Classes', 'Subscriptions'];
    for (const tab of tabs) {
      await expect(page.locator(`button.tab`, { hasText: tab })).toBeVisible();
    }
  });

  test('should view Class Schedule and see seeded data', async ({ page }) => {
    // Click on "Classes" tab
    await page.locator('button.tab', { hasText: 'Classes' }).click();
    
    // Wait for the class schedule heading
    await expect(page.locator('h2', { hasText: 'Class Schedule' })).toBeVisible();

    // Verify seeded class "Toan Nang Cao" exists
    await expect(page.locator('text=Toan Nang Cao').first()).toBeVisible();
    await expect(page.locator('text=Thay Minh').first()).toBeVisible();
  });
  
  test('should navigate to Subscription and see seeded data', async ({ page }) => {
    // Click on "Subscriptions" tab
    await page.locator('button.tab', { hasText: 'Subscriptions' }).click();
    
    await expect(page.locator('h2', { hasText: 'Subscriptions' })).toBeVisible();
    
    // Seeded data has package "Goi Hoc 3 Thang"
    await expect(page.locator('text=Goi Hoc 3 Thang').first()).toBeVisible();
  });
});
