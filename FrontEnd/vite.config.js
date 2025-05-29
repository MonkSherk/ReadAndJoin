import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // чтобы в импортах работало `import x from 'src/…'`
      src: path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // все REST‐запросы на /api будут проксироваться на Django
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // WebSocket на /ws проксируем в ws://localhost:8000
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
})
