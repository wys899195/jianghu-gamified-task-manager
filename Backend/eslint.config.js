// ========================================
// 定義 Backend ESLint 靜態檢查設定，ESLint 用於本機開發、CI 與部署前檢查程式品質。
// ========================================

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import {
    defineConfig,
    globalIgnores,
} from 'eslint/config';


export default defineConfig([
    // 忽略編譯與Jest測試覆蓋率輸出。
    globalIgnores([
        'dist',
        'coverage',
    ]),
    {
        // 後端 TypeScript source 使用 ESLint 與 typescript-eslint 推薦規則。
        files: ['**/*.ts'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
        ],
        languageOptions: {
            // 後端程式可以使用 Node.js global。
            globals: globals.node,
        },
        rules: {
            // Express middleware 常用 _req/_next 表示刻意保留但未使用的參數。
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        // 測試檔允許 Jest global。
        files: [
            'test/**/*.ts',
        ],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
    },
]);
