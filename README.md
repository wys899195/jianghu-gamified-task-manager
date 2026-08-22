# Jianghu Gamified Task Manager
### 江湖練功房：一款武俠風遊戲化的任務管理 Web app
A full-stack wuxia-inspired gamified task management app that turns real-life actions into character growth, built with React, TypeScript, Node.js, Express, and MySQL.



## 執行環境與前置準備

### 作業系統：Ubuntu Linux

- ### Docker

  本專案需要使用 Docker Engine 與 Docker Compose 啟動 MySQL 容器，MySQL 則不需要在主機另外安裝。

  可參考[安裝docker教學](https://ithelp.ithome.com.tw/m/articles/10267325)。

- ### Node.js

  請安裝 Node.js 22.12.0 以上版本。

  可從 [Node.js 官方頁面](https://nodejs.org/en/download)下載。

- ### 必要指令

  - git
  - curl

  在 Ubuntu Linux 可以使用以下指令安裝 `git` 與 `curl`：

  ```sh
  sudo apt-get update
  sudo apt-get install -y git curl
  ```

- ### 建議安裝的指令

  - Postman CLI
    - 如果需要執行API自動化測試，請用以下指令安裝Postman CLI：

        ```sh
        curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh
        postman --version
        ```

    - 詳細安裝方式請參考 [Postman CLI 安裝文件](https://learning.postman.com/docs/postman-cli/postman-cli-installation/)。

## 部署與運行

**本專案使用shell script來快速部署與運行，執行以下腳本前，請確認「執行環境與前置準備」所列環境與指令均已準備完成。**


- Clone 本專案後，請先執行以下初始化專用腳本。此腳本會建立必要的 `.env` 檔案並安裝 Backend 與 Frontend 的依賴套件；執行過程中請依提示設定兩組新的資料庫密碼。

    ```sh
    sh/init/initialize_after_clone.sh
    ```

- 接著可執行以下腳本，部署開發模式專用的資料庫並啟動前後端服務：

    ```sh
    sh/dev/deploy_and_start.sh
    ```
**其他常用腳本的說明請參考 [`sh/README.md`](sh/README.md)。**


## 專案執行模式

本專案有三種執行環境（模式），每個模式有專用的資料庫、後端與前端環境設定：

| 模式 | 用途 |
|---|---|
| `dev` | 開發模式，供開發、debug 用。 |
| `test` | 測試模式，供自動化測試與功能驗收用。 |
| `prod` | 正式模式，用於部署正式版服務。 |
