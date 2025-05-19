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
            description: 'Annual checkup and vaccination'
        };

        await ownersPage.addNewVisit(ownerLastName, petName, visitData);
        await ownersPage.navigateToFindOwners();
        await ownersPage.verifyVisitExists(ownerLastName, petName, visitData.description);
    });

    test('should validate required fields for visit', async () => {
        const ownerLastName = 'Davis';
        const petName = 'Max';
        const visitData = {
            date: '',
            description: ''
        };

        await ownersPage.addNewVisit(ownerLastName, petName, visitData);
        await ownersPage.verifyValidationError('date', 'is required');
        await ownersPage.verifyValidationError('description', 'is required');
    });

    test('should validate date format for visit', async () => {
        const ownerLastName = 'Davis';
        const petName = 'Max';
        const visitData = {
            date: 'invalid-date',
            description: 'Regular checkup'
        };

        await ownersPage.addNewVisit(ownerLastName, petName, visitData);
        await ownersPage.verifyValidationError('date', 'invalid date');
    });

    test('should not allow future dates for visits', async () => {
        const ownerLastName = 'Davis';
        const petName = 'Max';
        const visitData = {
            date: '2026-01-01', // Future date
            description: 'Scheduled checkup'
        };

        await ownersPage.addNewVisit(ownerLastName, petName, visitData);
        await ownersPage.verifyValidationError('date', 'cannot be in the future');
    });
});
