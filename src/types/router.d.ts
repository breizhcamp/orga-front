import type { RouteLocationNormalized } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    // Titre simple ou généré dynamiquement à partir de la route
    title?: string | ((to: RouteLocationNormalized) => string)
  }
}

export {}
