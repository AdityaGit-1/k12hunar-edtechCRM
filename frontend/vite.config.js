import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Matches CLIENT_URL in backend/.env.example, which the API allows through CORS.
    port: 5173,
  },
});
