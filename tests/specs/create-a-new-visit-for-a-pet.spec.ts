import { test } from '@playwright/test';
import { OwnersPage } from '../pages/ownersPage';

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

        await test.step('locate owner and pet', async () => {
            await ownersPage.findOwner(ownerLastName);
        });

        await test.step('schedule new visit', async () => {
            await ownersPage.addNewVisit(ownerLastName, petName, visitData);
        });

        await test.step('verify visit was scheduled', async () => {
            await ownersPage.verifyVisitExists(ownerLastName, petName, visitData.description);
        });
    });

    test('should validate required fields for visit', async () => {
        const ownerLastName = 'McTavish';
        const petName = 'George';
        const visitData = {
            date: '20026-01-01',
            description: ''
        };

        await test.step('attempt to create visit with invalid data', async () => {
            await ownersPage.addNewVisit(ownerLastName, petName, visitData);
        });

        await test.step('verify validation errors', async () => {
            await ownersPage.verifyValidationError('date', 'invalid date');
            await ownersPage.verifyValidationError('description', 'must not be blank');
        });
    });
});
