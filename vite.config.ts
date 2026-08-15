import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          const pkg = id.split(/node_modules[/\\]/).pop()?.split('/')[0];
          if (pkg === 'three' || pkg === 'three-stdlib') return 'three';
          if (pkg === '@react-three') return 'react-three';
          if (pkg === 'gsap') return 'gsap';
          if (pkg === 'react' || pkg === 'react-dom' || pkg === 'react-router-dom') return 'vendor';
          return undefined;
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['three', 'gsap', 'lenis']
  }
});
