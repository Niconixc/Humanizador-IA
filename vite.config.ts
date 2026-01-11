import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The '' third argument loads all env vars regardless of prefix (like VITE_)
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Expose the API_KEY safely to the client-side code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});