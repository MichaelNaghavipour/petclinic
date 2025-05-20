import { test, expect } from '@playwright/test';
import { OwnersPage } from '../pages/ownersPage';
import { testOwners } from '../test-data/owners.data';

test.describe('Owner Creation Feature', () => {
    let ownersPage: OwnersPage;

    test.beforeEach(async ({ page }) => {
        ownersPage = new OwnersPage(page);
        await ownersPage.navigateToHome();
        await ownersPage.navigateToFindOwners();
    });

    test('should create a new owner with valid data', async () => {
        await test.step('create new owner', async () => {
            await ownersPage.addNewOwner(testOwners.new.valid);
        });

        await test.step('verify owner information', async () => {
            const ownerInfo = await ownersPage.getOwnerInformation();
            const expectedName = `${testOwners.new.valid.firstName} ${testOwners.new.valid.lastName}`;
            
            expect(ownerInfo.name).toBe(expectedName);
            expect(ownerInfo.address).toBe(testOwners.new.valid.address);
            expect(ownerInfo.city).toBe(testOwners.new.valid.city);
            expect(ownerInfo.telephone).toBe(testOwners.new.valid.telephone);
        });
    });

    test('should validate all required fields when submitting empty form', async () => {
        await test.step('submit empty form', async () => {
            await ownersPage.addNewOwner(testOwners.new.invalid);
        });

        await test.step('verify validation errors', async () => {
            for (const field of ['firstName', 'lastName', 'address', 'city']) {
                const error = ownersPage.getValidationError(field);
                await expect(error).toContainText('must not be blank');
            }
            
            const phoneError = ownersPage.getValidationError('telephone');
            await expect(phoneError).toContainText('Telephone must be a 10-digit number');
            await expect(phoneError).toContainText('Telephone must be a 10-digit number');
        });
    });

    test('should validate telephone number format', async () => {
        const invalidOwner = { ...testOwners.new.valid, telephone: 'abc' };

        await test.step('submit form with invalid phone', async () => {
            await ownersPage.addNewOwner(invalidOwner);
        });

        await test.step('verify phone validation error', async () => {
            const phoneError = ownersPage.getValidationError('telephone');
            await expect(phoneError).toContainText('Telephone must be a 10-digit number');
        });
    });
});
