// ========================================
// 統一管理所有 Service Error Code 與 HTTP Status map。
// ========================================

import {
    userErrorHttpStatusMap,
} from '../../modules/user/errors/UserErrorHttpStatusMap.js';



export const errorHttpStatusMap = {
    ...userErrorHttpStatusMap,
} as const;