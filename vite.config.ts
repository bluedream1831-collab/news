
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  // 核心修復：將 Vercel 的環境變數注入到前端程式碼中
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});
