import { test, expect } from '@playwright/test';
import { OwnersPage } from '../pages/ownersPage';
import { testOwners } from '../test-data/owners.data';

test.describe('Pet Visit Feature', () => {
    let ownersPage: OwnersPage;

    test.beforeEach(async ({ page }) => {
        ownersPage = new OwnersPage(page);
        await ownersPage.navigateToHome();
        await ownersPage.navigateToFindOwners();
    });

    test('should add a new visit for existing pet', async () => {
        const { lastName } = testOwners.existing.rodriquez;
        const { name: petName } = testOwners.existing.rodriquez.pets.rosy;
        const visitData = {
            date: '2025-05-20',
            description: 'Annual checkup'
        };

        await test.step('schedule new visit', async () => {
            await ownersPage.addNewVisit(lastName, petName, visitData);
        });

        await test.step('verify visit was scheduled', async () => {
            const visitRow = ownersPage.getVisitRow(petName, visitData.description);
            await expect(visitRow).toBeVisible();
        });
    });

    test('should validate required fields for visit', async () => {
        const { lastName } = testOwners.existing.mctavish;
        const { name: petName } = testOwners.existing.mctavish.pets.george;
        const visitData = {
            date: '20026-01-01',
            description: ''
        };

        await test.step('attempt to create visit with invalid data', async () => {
            await ownersPage.addNewVisit(lastName, petName, visitData);
        });

        await test.step('verify validation errors', async () => {
            const dateError = ownersPage.getValidationError('date');
            const descriptionError = ownersPage.getValidationError('description');
            
            await expect(dateError).toContainText('invalid date');
            await expect(descriptionError).toContainText('must not be blank');
        });
    });
});
