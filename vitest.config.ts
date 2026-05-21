import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // インストールした jsdom（仮想ブラウザ環境）を使う設定
    environment: 'jsdom',
    // describe や it をグローバル（インポートなし）でも使えるようにする設定
    globals: true,
  },
  resolve: {
    alias: {
      //「@/lib/supabase」などの「@」パスをVitestに理解させる設定
      '@': path.resolve(__dirname, './src'),
    },
  },
})