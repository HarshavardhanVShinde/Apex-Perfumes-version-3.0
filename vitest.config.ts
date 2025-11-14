import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://wnaxppdlvfcfeluxlvxn.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYXhwcGRsdmZjZmVsdXhsdnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzk2OTMsImV4cCI6MjA3NDkxNTY5M30.iER5WnyKLkLcTzrLkgEDz44fZK1Q1OJ1kQ_9UOsF3As',
    },
  },
})