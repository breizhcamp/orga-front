/// <reference types="vite/client" />

import '@vue/runtime-dom';

declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    'data-testid'?: string;
  }

  interface ButtonHTMLAttributes {
    'data-bs-toggle'?: string;
    'data-bs-dismiss'?: string;
  }
}
