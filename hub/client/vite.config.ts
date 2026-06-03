import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 22400,
    proxy: {
      '/workspaces': 'http://127.0.0.1:22351',
      '/browse-folder': 'http://127.0.0.1:22351',
      '/recent-workspaces': 'http://127.0.0.1:22351',
      '/check-sdd': 'http://127.0.0.1:22351',
      '/plugin-skills': 'http://127.0.0.1:22351',
    },
    // note: /workspaces proxy above covers /workspaces/:id/specs too
  },
  build: {
    outDir: 'dist',
  },
})
