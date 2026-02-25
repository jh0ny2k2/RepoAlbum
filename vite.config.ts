import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths()
  ],
})
