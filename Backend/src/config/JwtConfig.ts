// ========================================
// Backend JWT Configuration
// ========================================

import { jwtEnv } from './Env.js';


export const jwtConfig = {
    algorithm: 'HS256', // (TODO: 之後微服務版須支援非對稱演算法，如 RS256)
    secret: jwtEnv.JWT_SECRET,
} as const;