// ========================================
// 定義 Frontend ESLint 靜態檢查設定，用於本機開發、CI 與部署前檢查程式品質。
// ========================================

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    // 忽略 Vite build output。
    globalIgnores(['dist']),
    {
        // 前端只檢查 TypeScript 與 React component 檔案。
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            // 前端程式可以使用 browser global，例如 window、document。
            globals: globals.browser,
        },
    },
])
