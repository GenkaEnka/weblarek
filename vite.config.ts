import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://larek-api.nomoreparties.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/content': {
        target: 'https://larek-api.nomoreparties.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/content/, '/content'),
      },
    },
  },
});
