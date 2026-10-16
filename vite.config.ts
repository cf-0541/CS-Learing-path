import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: { 'process.env': '{}' },
  worker: { format: 'es' },
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
  },
})


