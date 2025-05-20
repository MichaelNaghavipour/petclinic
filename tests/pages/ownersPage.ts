import { Page, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { findSourceMap } from 'module';
import { url } from 'inspector';

export class OwnersPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async findOwner(lastName: string): Promise<void> {
        // Check current URL and navigate if needed
        const currentUrl = this.page.url();
        if (!currentUrl.endsWith('/owners/find')) {
            await this.page.goto('/owners/find');
        }

        const lastNameInput = this.page.locator('#lastName');
        await lastNameInput.fill(lastName);
        const findOwnerButton = this.page.getByRole('button', { name: 'Find Owner' });
        await findOwnerButton.click();
    }

    async addNewOwner(ownerData: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        telephone: string;
    }) {
        const addOwnerButton = this.page.getByRole('link', { name: 'Add Owner' });
        await addOwnerButton.click();
        await this.page.fill('#firstName', ownerData.firstName);
        await this.page.fill('#lastName', ownerData.lastName);
        await this.page.fill('#address', ownerData.address);
        await this.page.fill('#city', ownerData.city);
        await this.page.fill('#telephone', ownerData.telephone);
        await this.page.click('button[type="submit"]');
    }

    async verifyOwnerExists(lastName: string): Promise<number> {
        const ownerData = this.page.locator('td', { hasText: lastName });
        await expect(ownerData.first()).toBeVisible();
        return ownerData.count();
    }

    async verifyNoOwnersFound() {
        const noResultsMessage = this.page.locator('text=has not been found');
        await expect(noResultsMessage).toBeVisible();
    }

    async addNewPet(ownerLastName: string, petData: {
        name: string;
        birthDate: string;
        type: string;
    }) {
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
    }) {
        await this.findOwner(ownerLastName);
        
        // Find the specific pet's row and its Add Visit link
        const petRow = this.page.locator('tr', {
            has: this.page.locator('dl.dl-horizontal dd', { hasText: petName })
        });
        const addVisitLink = petRow.locator('a:has-text("Add Visit")');
        await addVisitLink.click();
        
        // Fill in the visit form
        await this.page.fill('#date', visitData.date);
        await this.page.fill('#description', visitData.description);
        await this.page.click('button[type="submit"]');
    }

    /**
     * Verifies validation error message for a specific field
     * @param fieldId - The ID of the field to check
     * @param expectedError - Expected error message
     */
    async verifyValidationError(fieldId: string, expectedError: string): Promise<void> {
        // Use a specific selector that matches the exact HTML structure
        const formGroup = this.page.locator(`div.form-group.has-error:has(label[for="${fieldId}"])`);
        
        // Wait for and verify the form group exists
        await formGroup.waitFor({ state: 'visible' });
        
        // Verify the error icon is visible
        await expect(formGroup.locator('span.fa-remove.form-control-feedback')).toBeVisible();
        
        // Verify the error message
        const errorMessage = formGroup.locator('span.help-inline');
        await expect(errorMessage).toContainText(expectedError);
    }

    /**
     * Verifies that all required fields show appropriate validation messages
     */
    async verifyAllFieldsRequired(): Promise<void> {
        await this.verifyValidationError('firstName', 'must not be blank');
        await this.verifyValidationError('lastName', 'must not be blank');
        await this.verifyValidationError('address', 'must not be blank');
        await this.verifyValidationError('city', 'must not be blank');
        await this.verifyValidationError('telephone', 'must not be blank');
        await this.verifyValidationError('telephone', 'Telephone must be a 10-digit number');
    }

    async verifyPetExists(ownerLastName: string, petName: string) {
        await this.findOwner(ownerLastName);
        const petElement = this.page.locator('td', { hasText: petName });
        await expect(petElement).toBeVisible();
    }

    async verifyVisitExists(ownerLastName: string, petName: string, description: string) {
        await this.findOwner(ownerLastName);
        
        // Find the specific pet's row
        const petRow = this.page.locator('tr', {
            has: this.page.locator('dl.dl-horizontal dd', { hasText: petName })
        });
        
        // Get the visits table within this row and wait for it
        const visitsTable = petRow.locator('table.table-condensed');
        await visitsTable.waitFor({ state: 'visible' });
        
        // Look for the specific visit within the pet's visits table
        const visitRow = visitsTable.getByRole('row', {
            name: new RegExp(`.*${description}.*`)
        });
        
        // Verify the visit exists
        await expect(visitRow).toBeVisible();
    }

    async getOwnersCount(): Promise<number> {
        const ownerRows = this.page.locator('table#owners tbody tr');
        return await ownerRows.count();
    }

    async verifyOwnerInformation(newOwner: {
        firstName: string,
        lastName: string,
        address: string,
        city: string,
        telephone: string
    }): Promise<boolean> {
        const ownerInfoTable = this.page.locator('table tbody');
        
        // Get all the information from the table
        const actualName = await ownerInfoTable.locator('tr').nth(0).locator('td').textContent() || '';
        const actualAddress = await ownerInfoTable.locator('tr').nth(1).locator('td').textContent() || '';
        const actualCity = await ownerInfoTable.locator('tr').nth(2).locator('td').textContent() || '';
        const actualTelephone = await ownerInfoTable.locator('tr').nth(3).locator('td').textContent() || '';
        
        // Compare all fields
        return (
            actualName === `${newOwner.firstName} ${newOwner.lastName}` &&
            actualAddress === newOwner.address &&
            actualCity === newOwner.city &&
            actualTelephone === newOwner.telephone
        );
    }
}
