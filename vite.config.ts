import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { dirname, resolve } from 'path'
import MarkdownIt from 'markdown-it'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // 设置 @ 指向 src 目录
      '~': resolve(__dirname, 'src/assets'), // 可选：设置 ~ 指向 assets 目录
    }
  },
  assetsInclude: ['**/*.md'],  // 添加对 Markdown 文件的支持
})
