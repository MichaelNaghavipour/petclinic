import { test, expect } from '@playwright/test';
import { OwnersPage } from '../pages/ownersPage';
import { testOwners } from '../test-data/owners.data';

test.describe('Pet Creation Feature', () => {
    let ownersPage: OwnersPage;

    test.beforeEach(async ({ page }) => {
        ownersPage = new OwnersPage(page);
        await ownersPage.navigateToHome();
        await ownersPage.navigateToFindOwners();
    });

    test('should add a new pet to existing owner', async () => {
        const { lastName } = testOwners.existing.franklin;
        const petData = {
            name: 'Max',
            birthDate: '2025-01-01',
            type: 'dog'
        };

        await test.step('add new pet', async () => {
            await ownersPage.addNewPet(lastName, petData);
        });

        await test.step('verify pet added', async () => {
            await ownersPage.navigateToFindOwners();
            await ownersPage.findOwner(lastName);
            const petRow = ownersPage.getPetRow(petData.name);
            await expect(petRow).toBeVisible();
        });
    });

    test('should validate unique pet name for owner', async () => {
        const { lastName } = testOwners.existing.franklin;
        const petData = {
            name: 'Max',
            birthDate: '2022-02-02',
            type: 'cat'
        };

        await test.step('attempt to add duplicate pet', async () => {
            await ownersPage.addNewPet(lastName, petData);
        });

        await test.step('verify duplicate name error', async () => {
            const nameError = ownersPage.getValidationError('name');
            await expect(nameError).toContainText('is already in use');
        });
    });

    test('should validate required fields for pet', async () => {
        const { lastName } = testOwners.existing.franklin;
        const petData = {
            name: '',
            birthDate: '',
            type: 'bird'
        };

        await test.step('submit empty pet form', async () => {
            await ownersPage.addNewPet(lastName, petData);
        });

        await test.step('verify validation errors', async () => {
            const nameError = ownersPage.getValidationError('name');
            const dateError = ownersPage.getValidationError('birthDate');
            
            await expect(nameError).toContainText('is required');
            await expect(dateError).toContainText('is required');
        });
    });
});
