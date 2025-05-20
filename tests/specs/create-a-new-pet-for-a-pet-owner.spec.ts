import { test } from '@playwright/test';
import { OwnersPage } from '../pages/ownersPage';

test.describe('Pet Creation Feature', () => {
    let ownersPage: OwnersPage;

    test.beforeEach(async ({ page }) => {
        ownersPage = new OwnersPage(page);
        await ownersPage.navigateToHome();
        await ownersPage.navigateToFindOwners();
    });

    test('should add a new pet to existing owner', async () => {
        const ownerLastName = 'Franklin';
        const petData = {
            name: 'Max',
            birthDate: '2025-01-01',
            type: 'dog'
        };

        await ownersPage.addNewPet(ownerLastName, petData);
        await ownersPage.navigateToFindOwners();
        await ownersPage.verifyPetExists(ownerLastName, petData.name);
    });

    test('should validate unique pet name for owner', async () => {
        const ownerLastName = 'Franklin';
        const petData = {
            name: 'Max', // same name as previous test
            birthDate: '2022-02-02',
            type: 'cat'
        };

        await ownersPage.addNewPet(ownerLastName, petData);
        await ownersPage.verifyValidationError('name', 'is already in use');
    });

    test('should validate required fields for pet', async () => {
        const ownerLastName = 'Franklin';
        const petData = {
            name: '',
            birthDate: '',
            type: 'bird'
        };

        await ownersPage.addNewPet(ownerLastName, petData);
        await ownersPage.verifyValidationError('name', 'is required');
        await ownersPage.verifyValidationError('birthDate', 'is required');
    });
});
