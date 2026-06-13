import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// NOTE: `base` must match your GitHub repository name for GitHub Pages.
// If your repo is https://github.com/you/excel-assessment-platform
// then base should be '/excel-assessment-platform/'.
export default defineConfig({
  plugins: [react()],
  base: '/excel_for_data_analytics/',
  build: {
    // Split heavy vendors into separate cacheable chunks for faster loads.
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          charts: ['recharts'],
          export: ['xlsx', 'file-saver'],
        },
      },
    },
  },
})
