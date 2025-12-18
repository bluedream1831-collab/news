
# 雙語編輯天才 (Bilingual Editorial Genius) ✍️

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg?style=flat-square)
![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%203%20Flash-8E44AD.svg?style=flat-square&logo=google)

這是一個強大的 AI 雙語內容生成工具，利用 **Google Gemini 3** 模型將原始素材轉化為 SEO 優化的英文部落格文章以及吸睛的中文社群貼文。

## 🔑 如何設定 API Key (API Key Setup)

本專案支援兩種 Key 獲取方式：

### 1. Vercel 環境變數 (生產環境)
如果您是部署在 Vercel，請務必設定環境變數：
1. 前往 [Vercel Project Settings] > [Environment Variables]。
2. 新增名稱為 `API_KEY` 的變數。
3. 值填入來自 [Google AI Studio](https://aistudio.google.com/app/apikey) 的 Key。
4. **重新部署 (Redeploy)** 專案以生效。

### 2. 應用內專案選取 (Pro 模型專用)
當使用 **Gemini 3 Pro** 等高級模型時，系統會跳出彈窗：
1. 點擊 **"選取付費 API 金鑰"**。
2. 在彈出的 Google 視窗中選取您的付費 Google Cloud 專案。
3. 系統將自動完成對接，無需手動輸入。

## 🚀 部署到 Vercel (Deployment Troubleshooting)

如果您在 Vercel 找不到 GitHub 儲存庫：
*   **調整權限**：點擊 GitHub 帳號下拉選單 -> **Adjust GitHub App Permissions**。確保勾選了新專案。
*   **手動匯入**：直接在 Vercel 匯入框貼上 GitHub 儲存庫的 HTTPS 網址。

## ✨ 核心功能 (Features)

*   **🔍 即時熱搜話題**：整合 Google Search 獲取最新熱門趨勢。
*   **🌏 雙語同步生成**：同步產出英文 SEO 文章與中文社群貼文（Threads/IG）。
*   **🎨 寫作風格切換**：支援專業、故事、幽默等四種風格。
*   **💾 自動儲存草稿**：編輯內容會自動儲存於瀏覽器，防止遺失。
