import { globalIgnores } from 'eslint/config';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import stylistic from '@stylistic/eslint-plugin';
import pluginQuery from '@tanstack/eslint-plugin-query';

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.strictTypeChecked,
  vueTsConfigs.stylistic,
  stylistic.configs.customize({
    semi: true,
  }),
  pluginQuery.configs['flat/recommended-strict'],
  {
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
);
