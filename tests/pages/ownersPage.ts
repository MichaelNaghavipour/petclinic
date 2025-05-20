import { Page, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { findSourceMap } from 'module';
import { url } from 'inspector';
import { FIND_OWNERS_URL } from '../constants/urls';

/**
 * Page object for managing pet clinic owners, their pets, and visits
 */
export class OwnersPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    /**
     * Searches for an owner by last name, navigating to find owners page if needed
     */
    async findOwner(lastName: string): Promise<void> {
        // Check current URL and navigate if needed
        const currentUrl = this.page.url();
        if (!currentUrl.endsWith(FIND_OWNERS_URL)) {
            await this.page.goto(FIND_OWNERS_URL);
        }

        const lastNameInput = this.page.locator('#lastName');
        await lastNameInput.fill(lastName);
        const findOwnerButton = this.page.getByRole('button', { name: 'Find Owner' });
        await findOwnerButton.click();
    }

    /**
     * Creates a new owner with provided details
     */
    async addNewOwner(ownerData: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        telephone: string;
    }): Promise<void> {
        const addOwnerButton = this.page.getByRole('link', { name: 'Add Owner' });
        await addOwnerButton.click();
        await this.page.fill('#firstName', ownerData.firstName);
        await this.page.fill('#lastName', ownerData.lastName);
        await this.page.fill('#address', ownerData.address);
        await this.page.fill('#city', ownerData.city);
        await this.page.fill('#telephone', ownerData.telephone);
        await this.page.click('button[type="submit"]');
    }

    /**
     * Verifies owner exists and returns the number of matches found
     */
    async verifyOwnerExists(lastName: string): Promise<number> {
        const ownerData = this.page.locator('td', { hasText: lastName });
        await expect(ownerData.first()).toBeVisible();
        return ownerData.count();
    }

    /**
     * Verifies "owner not found" message is displayed
     */
    async verifyNoOwnersFound(): Promise<void> {
        const noResultsMessage = this.page.locator('text=has not been found');
        await expect(noResultsMessage).toBeVisible();
    }

    /**
     * Adds a new pet to an existing owner's record
     */
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

    /**
     * Schedules a new visit for a specific pet
     */
    async addNewVisit(ownerLastName: string, petName: string, visitData: {
        date: string;
        description: string;
    }): Promise<void> {
        await this.findOwner(ownerLastName);
        const petRow = this.page.locator('tr', {
            has: this.page.locator('dl.dl-horizontal dd', { hasText: petName })
        });
        const addVisitLink = petRow.locator('a:has-text("Add Visit")');
        await addVisitLink.click();
        await this.page.fill('#date', visitData.date);
        await this.page.fill('#description', visitData.description);
        await this.page.click('button[type="submit"]');
    }

    /**
     * Validates form field errors and their corresponding messages
     */
    async verifyValidationError(fieldId: string, expectedError: string): Promise<void> {
        const formGroup = this.page.locator(`div.form-group.has-error:has(label[for="${fieldId}"])`);
        
        await formGroup.waitFor({ state: 'visible' });
        
        await expect(formGroup.locator('span.fa-remove.form-control-feedback')).toBeVisible();
        
        const errorMessage = formGroup.locator('span.help-inline');
        await expect(errorMessage).toContainText(expectedError);
    }

    /**
     * Validates all required owner information fields
     */
    async verifyAllFieldsRequired(): Promise<void> {
        await this.verifyValidationError('firstName', 'must not be blank');
        await this.verifyValidationError('lastName', 'must not be blank');
        await this.verifyValidationError('address', 'must not be blank');
        await this.verifyValidationError('city', 'must not be blank');
        await this.verifyValidationError('telephone', 'must not be blank');
        await this.verifyValidationError('telephone', 'Telephone must be a 10-digit number');
    }

    /**
     * Verifies a pet exists in the owner's record
     */
    async verifyPetExists(ownerLastName: string, petName: string): Promise<void> {
        await this.findOwner(ownerLastName);
        const petElement = this.page.locator('td', { hasText: petName });
        await expect(petElement).toBeVisible();
    }

    /**
     * Verifies a visit exists in the pet's record
     */
    async verifyVisitExists(ownerLastName: string, petName: string, description: string): Promise<void> {
        await this.findOwner(ownerLastName);
        
        const petRow = this.page.locator('tr', {
            has: this.page.locator('dl.dl-horizontal dd', { hasText: petName })
        });
        
        const visitsTable = petRow.locator('table.table-condensed');
        await visitsTable.waitFor({ state: 'visible' });
        
        const visitRow = visitsTable.getByRole('row', {
            name: new RegExp(`.*${description}.*`)
        });
        
        await expect(visitRow).toBeVisible();
    }

    /**
     * Returns the total number of owners in the list
     */
    async getOwnersCount(): Promise<number> {
        const ownerRows = this.page.locator('table#owners tbody tr');
        return await ownerRows.count();
    }

    /**
     * Validates owner information matches the provided data
     */
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
