import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The '' third argument loads all env vars regardless of prefix (like VITE_)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Expose the API_KEY safely to the client-side code
      // In Vercel, use process.env directly, in dev use .env file
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY),
    },
  };
});