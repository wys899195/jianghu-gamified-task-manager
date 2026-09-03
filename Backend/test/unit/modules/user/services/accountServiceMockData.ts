import type {
    DeleteAccountRequest,
} from '../../../../../src/modules/user/requestSchemas/accountRequestSchema.js';


export const accountId = 42;
export const currentPassword = 'Current123';
export const wrongPassword = 'Wrong1234';
export const currentPasswordHash = 'fake-current-password-hash';

export const validDeleteAccountRequest = {
    password: currentPassword,
} satisfies DeleteAccountRequest;

export const wrongPasswordDeleteAccountRequest = {
    password: wrongPassword,
} satisfies DeleteAccountRequest;
