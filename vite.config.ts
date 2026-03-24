import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import * as esbuild from 'esbuild';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-files',
      async closeBundle() {
        // Copy manifest.json to dist
        copyFileSync(
          resolve(__dirname, 'public/manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        );
        
        // Create directories
        mkdirSync(resolve(__dirname, 'dist/icons'), { recursive: true });
        mkdirSync(resolve(__dirname, 'dist/content-scripts'), { recursive: true });
        mkdirSync(resolve(__dirname, 'dist/scripts/youtube'), { recursive: true });
        mkdirSync(resolve(__dirname, 'dist/scripts/github'), { recursive: true });
        mkdirSync(resolve(__dirname, 'dist/scripts/core'), { recursive: true });
        
        // Copy trusted types bypass script
        copyFileSync(
          resolve(__dirname, 'src/content-scripts/trusted-types-bypass.js'),
          resolve(__dirname, 'dist/content-scripts/trusted-types-bypass.js')
        );
        
        // Copy YouTube scripts (compile .ts to .js)
        const compileAndCopyDir = async (src: string, dest: string) => {
          const entries = readdirSync(src);
          for (const entry of entries) {
            const srcPath = join(src, entry);            const destPath = join(dest, entry);
            if (statSync(srcPath).isDirectory()) {
              mkdirSync(destPath, { recursive: true });
              await compileAndCopyDir(srcPath, destPath);
            } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
              // Compile TypeScript to JavaScript using esbuild
              const result = await esbuild.build({
                entryPoints: [srcPath],
                write: false,
                format: 'iife',
                target: 'es2020',
                minify: false,
              });
              const jsPath = destPath.replace(/\.ts$/, '.js');
              writeFileSync(jsPath, result.outputFiles[0].text);
            } else if (entry.endsWith('.js')) {
              copyFileSync(srcPath, destPath);
            }
          }
        };
        
        // Compile and copy scripts
        await compileAndCopyDir(
          resolve(__dirname, 'src/content-scripts/youtube'),
          resolve(__dirname, 'dist/scripts/youtube')
        );
        await compileAndCopyDir(
          resolve(__dirname, 'src/content-scripts/github'),
          resolve(__dirname, 'dist/scripts/github')
        );
        
        // Compile dom-utils.ts to core directory
        const domUtilsResult = await esbuild.build({
          entryPoints: [resolve(__dirname, 'src/core/dom-utils.ts')],
          write: false,
          format: 'iife',
          target: 'es2020',
          minify: false,
        });
        writeFileSync(
          resolve(__dirname, 'dist/scripts/core/dom-utils.js'),
          domUtilsResult.outputFiles[0].text
        );
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Service worker (background script)
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        // Options page
        options: resolve(__dirname, 'src/options/options.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Place service worker in root of dist
          if (chunkInfo.name === 'service-worker') {
            return 'service-worker.js';
          }
          // Everything else in appropriate folders
          return 'assets/[name].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@config': resolve(__dirname, 'config'),
    },
  },
});
