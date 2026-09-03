// ========================================
// Backend Auth Configuration
// ========================================

import { authEnv } from './Env.js';
import ms from 'ms';


export const authConfig = {
    jwtAlgorithm: 'HS256',
    jwtSecret: authEnv.JWT_SECRET,
    accessTokenExpiresIn: authEnv.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresInMs: ms(authEnv.REFRESH_TOKEN_EXPIRES_IN),
} as const;
