import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync, readFileSync, existsSync, rmSync, renameSync } from 'fs';
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
        
        // Create base directories (subdirectories are created by compileAndCopyDir)
        mkdirSync(resolve(__dirname, 'dist/icons'), { recursive: true });
        mkdirSync(resolve(__dirname, 'dist/page-scripts'), { recursive: true });
        mkdirSync(resolve(__dirname, 'dist/scripts'), { recursive: true });
        
        // Copy trusted types bypass script
        copyFileSync(
          resolve(__dirname, 'src/page-scripts/trusted-types-bypass.js'),
          resolve(__dirname, 'dist/page-scripts/trusted-types-bypass.js')
        );
        
        // Copy scripts (compile .ts to .js)
        const compileAndCopyDir = async (src: string, dest: string) => {
          // Ensure destination directory exists
          mkdirSync(dest, { recursive: true });
          
          const entries = readdirSync(src);
          for (const entry of entries) {
            const srcPath = join(src, entry);
            const destPath = join(dest, entry);
            
            if (statSync(srcPath).isDirectory()) {
              await compileAndCopyDir(srcPath, destPath);
            } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts') && !entry.endsWith('_config.ts')) {
              // Compile TypeScript content scripts to JavaScript using esbuild
              // Skip *_config.ts files as they're imported modules, not content scripts
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
        
        // Compile and copy all site/shared script directories
        const pageScriptsDir = resolve(__dirname, 'src/page-scripts');
        const entries = readdirSync(pageScriptsDir);
        
        for (const entry of entries) {
          const srcPath = join(pageScriptsDir, entry);
          
          // Only process directories (skip scripts.ts and trusted-types-bypass.js)
          if (statSync(srcPath).isDirectory()) {
            const destPath = resolve(__dirname, 'dist/scripts', entry);
            await compileAndCopyDir(srcPath, destPath);
          }
        }
        
        // Compile dom-utils.ts to core directory
        mkdirSync(resolve(__dirname, 'dist/scripts/core'), { recursive: true });
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
        'service-worker': resolve(__dirname, 'src/core/service-worker.ts'),
        // Web page
        index: resolve(__dirname, 'index.html'),
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
    // Generate sourcemaps only in development
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@config': resolve(__dirname, 'config'),
    },
  },
});
