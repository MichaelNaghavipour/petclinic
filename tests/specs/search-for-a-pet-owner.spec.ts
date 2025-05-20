import { test, expect } from '@playwright/test';
import { OwnersPage } from '../pages/ownersPage';
import { testOwners } from '../test-data/owners.data';

test.describe('Owner Search Feature', () => {
    let ownersPage: OwnersPage;
    
    test.beforeEach(async ({ page }) => {
        ownersPage = new OwnersPage(page);
        await ownersPage.navigateToHome();
        await ownersPage.navigateToFindOwners();
    });

    test('should find owner by exact last name match', async () => {
        const { lastName } = testOwners.existing.davis;
        
        await test.step('search for owner', async () => {
            await ownersPage.findOwner(lastName);
        });

        await test.step('verify owner found', async () => {
            const ownerRow = ownersPage.getOwnerRow(lastName);
            await expect(ownerRow).toBeVisible();
        });
    });

    test('should show not found message for non-existing owner', async () => {
        await test.step('search for non-existent owner', async () => {
            await ownersPage.findOwner('NonExistentOwner');
        });

        await test.step('verify not found message', async () => {
            const noResultsMessage = ownersPage.getNoResultsMessage();
            await expect(noResultsMessage).toBeVisible();
        });
    });

    test('should list all owners when searching with empty last name', async () => {
        await test.step('search with empty criteria', async () => {
            await ownersPage.findOwner('');
        });

        await test.step('verify owners list displayed', async () => {
            const { table, rows } = ownersPage.getOwnersTable();
            
            // First verify the table is visible
            await expect(table).toBeVisible();
            
            // Then verify we have owners listed
            const count = await rows.count();
            expect(count).toBeGreaterThan(0);
            
            // Verify first row is visible to ensure the list is populated
            const firstRow = rows.first();
            await expect(firstRow).toBeVisible();
        });
    });

    test('should find owner with partial last name match', async () => {
        const { lastName } = testOwners.existing.davis;
        const partialName = lastName.substring(0, 3);

        await test.step('search with partial name', async () => {
            await ownersPage.findOwner(partialName);
        });

        await test.step('verify matching owner found', async () => {
            const ownerRow = ownersPage.getOwnerRow(lastName);
            await expect(ownerRow).toBeVisible();
        });
    });
});
