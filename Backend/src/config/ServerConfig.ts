// ========================================
// Backend Server Configuration
// ========================================

import { serverEnv } from './Env.js';

export const serverConfig = {
    host: serverEnv.SERVER_HOST,
    port: serverEnv.SERVER_PORT,
} as const;
