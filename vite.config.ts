import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
		vue(),
	],
	resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src')
      }
    ]
  },
  build: {
    ...(process.env.BUILD === 'lib' && {
      outDir: 'lib',
      cssCodeSplit: false,
      lib: {
        entry: path.resolve(__dirname, 'src/lib.ts'),
        name: 'TimesidePlayer',
        fileName: format => `timeside-player.${format}.js`
      }
    })
  }
})
