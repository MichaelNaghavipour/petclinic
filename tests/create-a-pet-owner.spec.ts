import { test, expect } from '@playwright/test';
import { OwnersPage } from './pages/ownersPage';

test.describe('Owner Creation Feature', () => {
    let ownersPage: OwnersPage;

    test.beforeEach(async ({ page }) => {
        ownersPage = new OwnersPage(page);
        await ownersPage.navigateToHome();
        await ownersPage.navigateToFindOwners();
    });

    test('should create a new owner with valid data', async () => {
        const newOwner = {
            firstName: 'Jane',
            lastName: 'Doe',
            address: 'Berliner Strasse 101',
            city: 'Berlin',
            telephone: '0123456789'
        };
        
        await ownersPage.addNewOwner(newOwner);
    });

    test('should validate all required fields when submitting empty form', async () => {
        const emptyOwner = {
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            telephone: ''
        };

        await ownersPage.addNewOwner(emptyOwner);
        await ownersPage.verifyAllFieldsRequired();
    });

    test('should validate telephone number format', async () => {
        const ownerWithInvalidPhone = {
            firstName: 'Anna',
            lastName: 'Weber',
            address: 'Berliner Str. 45',
            city: 'Hamburg',
            telephone: 'abc'
        };

        await ownersPage.addNewOwner(ownerWithInvalidPhone);
        await ownersPage.verifyValidationError('telephone',
            'Telephone must be a 10-digit number');
    });
});
