import { Page } from '@playwright/test';

/**
 * Base page object containing common navigation and utilities
 */
export class BasePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /** Navigates to the application home page */
    async navigateToHome(): Promise<void> {
        await this.page.goto('/');
    }

    /** Navigates to the Find Owners page */
    async navigateToFindOwners(): Promise<void> {
        await this.page.getByRole('link', { name: 'Find Owners' }).click();
    }

    /** Waits for navigation to complete after an action */
    protected async waitForNavigation(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }
}
