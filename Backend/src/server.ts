// ========================================
// Backend Server Entry Point
// 負責啟動已完成組裝的 Express App。
// ========================================

import app from './app.js';

import {
    serverConfig,
} from './config/ServerConfig.js';


// ========================================
// Start Server
// ========================================

app.listen(
    serverConfig.port,
    serverConfig.host,
    () => {

        console.log(
            '現在時間:',
            new Date(),
        );

        console.log(
            'ISO UTC:',
            new Date().toISOString(),
        );

        console.log(
            'Timezone offset:',
            new Date().getTimezoneOffset(),
        );

        console.log(
            'Resolved timezone:',
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        );

        console.log(
            `Backend running at http://${serverConfig.host}:${serverConfig.port}`,
        );

    },
);