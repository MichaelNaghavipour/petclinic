import { Page } from '@playwright/test';

export class BasePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToHome() {
        await this.page.goto('/');
    }

    async navigateToFindOwners() {
        await this.page.getByRole('link', { name: 'Find Owners' }).click()
    }
}
