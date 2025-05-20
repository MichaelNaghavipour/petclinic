export const testOwners = {
    existing: {
        davis: {
            lastName: 'Davis'
        },
        franklin: {
            lastName: 'Franklin'
        },
        mctavish: {
            lastName: 'McTavish',
            pets: {
                george: {
                    name: 'George'
                }
            }
        },
        rodriquez: {
            lastName: 'Rodriquez',
            pets: {
                rosy: {
                    name: 'Rosy'
                }
            }
        }
    },
    new: {
        valid: {
            firstName: 'Jane',
            lastName: 'Doe',
            address: 'Berliner Strasse 101',
            city: 'Berlin',
            telephone: '0123456789'
        },
        invalid: {
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            telephone: 'abc'
        }
    }
};
