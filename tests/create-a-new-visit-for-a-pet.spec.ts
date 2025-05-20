import { test } from '@playwright/test';
import { OwnersPage } from './pages/ownersPage';

test.describe('Pet Visit Feature', () => {
    let ownersPage: OwnersPage;

    test.beforeEach(async ({ page }) => {
        ownersPage = new OwnersPage(page);
        await ownersPage.navigateToHome();
        await ownersPage.navigateToFindOwners();
    });

    test('should add a new visit for existing pet', async () => {
        const ownerLastName = 'Rodriquez';
        const petName = 'Rosy';
        const visitData = {
            date: '2025-05-20',
            description: 'Annual checkup'
        };

        await ownersPage.addNewVisit(ownerLastName, petName, visitData);
        await ownersPage.verifyVisitExists(ownerLastName, petName, visitData.description);
    });

    test('should validate required fields for visit', async () => {
        const ownerLastName = 'McTavish';
        const petName = 'George';
        const visitData = {
            date: '20026-01-01', // Invalid date format
            description: '' // Empty description
        };

        await ownersPage.addNewVisit(ownerLastName, petName, visitData);
        await ownersPage.verifyValidationError('date', 'invalid date');
        await ownersPage.verifyValidationError('description', 'must not be blank');
    });
});
