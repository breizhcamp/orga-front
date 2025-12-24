import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'

const current = fileURLToPath(import.meta.url);
const root = path.dirname(current);

function extractEnvVar(str: string): string[] {
  return str.split('${').map(v => v.split('}')[0]).slice(1)
}

const RuntimeEnvPlugin: PluginOption = {
  name: 'runtime-env-plugin',
  apply: 'serve',
  enforce: 'pre',
  configureServer(server) {
    return () => {
      server.middlewares.use((req, res, next) => {
        if (req.originalUrl != '/env.js') return next();

        const configContent = fs.readFileSync(
          path.resolve(root, './public/env.template.js'),
          'utf-8',
        );
        let content = configContent;
        extractEnvVar(configContent).forEach((v) => {
          if (process.env?.[v] && process.env?.[v]?.length) {
            content = content.replace('${' + v + '}', process.env[v]);
          } else {
            content = content.replace('${' + v + '}', '');
          }
        });
        res.setHeader('Content-Type', 'application/javascript');
        res.end(content);
      });
    };
  },
};


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [RuntimeEnvPlugin, vue(), vueDevTools(), svgLoader()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    port: 4000
  }
})
