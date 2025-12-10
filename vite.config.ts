import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace 'creator-giveaway-hub' with your GitHub repository name.
  // For example, if your repo is github.com/user/my-app, set base to '/my-app/'
  base: '/SFFatehub/',
});
