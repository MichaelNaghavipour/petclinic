import { test, expect } from '@playwright/test';
import { OwnersPage } from './pages/ownersPage';

test.describe('Owner Search Feature', () => {
    let ownersPage: OwnersPage;
    let firstOwnerLastName: string;
    
    test.beforeEach(async ({ page }) => {
        ownersPage = new OwnersPage(page);
        await ownersPage.navigateToHome();
        await ownersPage.navigateToFindOwners();
    });

    const lastName = 'Davis';

    test('should find owner by exact last name match', async () => {
        await ownersPage.findOwner(lastName);
        const ownersFound = await ownersPage.verifyOwnerExists(lastName);
        expect(ownersFound).toBeGreaterThan(0);
    });

    test('should show not found message for non-existing owner', async () => {
        await ownersPage.findOwner('NonExistentOwner');
        await ownersPage.verifyNoOwnersFound();
    });

    test('should list all owners when searching with empty last name', async () => {
        await ownersPage.findOwner('');
        const totalOwners = await ownersPage.getOwnersCount();
        expect(totalOwners).toBeGreaterThan(0);
    });

    test('should find owner with partial last name match', async () => {
        const partialName = lastName.substring(0, 3);
        await ownersPage.findOwner(partialName);
        const ownersFound = await ownersPage.verifyOwnerExists(lastName);
        expect(ownersFound).toBeGreaterThan(0);
    });
});
