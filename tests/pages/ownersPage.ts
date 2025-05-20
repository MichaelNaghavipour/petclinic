import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage.js'; // Ensure './basePage.js' exists and exports BasePage
import { FIND_OWNERS_URL } from '../constants/urls';

/**
 * Page object for managing pet clinic owners, their pets, and visits
 */
export class OwnersPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async findOwner(lastName: string): Promise<void> {
        if (!this.page.url().endsWith(FIND_OWNERS_URL)) {
            await this.page.goto(FIND_OWNERS_URL);
        }
        await this.page.fill('#lastName', lastName);
        await this.page.getByRole('button', { name: 'Find Owner' }).click();
    }

    async addNewOwner(ownerData: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        telephone: string;
    }): Promise<void> {
        await this.page.getByRole('link', { name: 'Add Owner' }).click();
        await this.page.fill('#firstName', ownerData.firstName);
        await this.page.fill('#lastName', ownerData.lastName);
        await this.page.fill('#address', ownerData.address);
        await this.page.fill('#city', ownerData.city);
        await this.page.fill('#telephone', ownerData.telephone);
        await this.page.click('button[type="submit"]');
    }

    getOwnerRow(lastName: string): Locator {
        return this.page.locator('td', { hasText: lastName }).first();
    }

    getNoResultsMessage(): Locator {
        return this.page.locator('text=has not been found');
    }

    getOwnersTable() {
        return {
            table: this.page.locator('table#owners'),
            rows: this.page.locator('table#owners tbody tr')
        };
    }

    getValidationError(fieldId: string): Locator {
        const formGroup = this.page.locator(`div.form-group.has-error:has(label[for="${fieldId}"])`);
        return formGroup.locator('span.help-inline');
    }

    getPetRow(petName: string): Locator {
        return this.page.locator('td', { hasText: petName });
    }

    getVisitRow(petName: string, description: string): Locator {
        const petRow = this.page.locator('tr', {
            has: this.page.locator('dl.dl-horizontal dd', { hasText: petName })
        });
        const visitsTable = petRow.locator('table.table-condensed');
        return visitsTable.getByRole('row', { name: new RegExp(`.*${description}.*`) });
    }

    getOwnerInformation(): Promise<{
        name: string;
        address: string;
        city: string;
        telephone: string;
    }> {
        const ownerInfoTable = this.page.locator('table.table-striped tbody');
        return ownerInfoTable.locator('tr').evaluateAll(rows => ({
            name: rows[0]?.querySelector('td')?.textContent?.trim() || '',
            address: rows[1]?.querySelector('td')?.textContent?.trim() || '',
            city: rows[2]?.querySelector('td')?.textContent?.trim() || '',
            telephone: rows[3]?.querySelector('td')?.textContent?.trim() || ''
        }));
    }

    // Keep action methods that chain multiple steps
    async addNewPet(ownerLastName: string, petData: {
        name: string;
        birthDate: string;
        type: string;
    }): Promise<void> {
        await this.findOwner(ownerLastName);
        await this.page.click('a[href$="/pets/new"]');
        await this.page.fill('#name', petData.name);
        await this.page.fill('#birthDate', petData.birthDate);
        await this.page.selectOption('#type', petData.type);
        await this.page.click('button[type="submit"]');
    }

    async addNewVisit(ownerLastName: string, petName: string, visitData: {
        date: string;
        description: string;
    }): Promise<void> {
        await this.findOwner(ownerLastName);
        const petRow = this.page.locator('tr', {
            has: this.page.locator('dl.dl-horizontal dd', { hasText: petName })
        });
        await petRow.locator('a:has-text("Add Visit")').click();
        await this.page.fill('#date', visitData.date);
        await this.page.fill('#description', visitData.description);
        await this.page.click('button[type="submit"]');
    }
}
