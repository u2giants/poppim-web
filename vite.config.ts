import path from "path"
import { execSync } from "node:child_process"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function gitValue(command: string, fallback: string) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || fallback
  } catch {
    return fallback
  }
}

process.env.VITE_BUILD_GIT_SHA ||= gitValue('git rev-parse HEAD', 'local')
process.env.VITE_BUILD_COMMIT_DATE ||= gitValue('git show -s --format=%cI HEAD', '')
process.env.VITE_BUILD_RUN ||= 'local'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
