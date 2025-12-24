import { initRouter } from '@/router';
import { vueKeycloak } from '@josempgon/vue-keycloak';
import { VueQueryPlugin } from '@tanstack/vue-query';

import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createAxiosClient } from './utils/createAxios'
import { kalonAxiosKey, moneizAxiosKey } from './provide-keys'

window.envLoaded.then(async () => {
  const app = createApp(App)
  app.use(VueQueryPlugin)

  // Provide axios instances
  app.provide(kalonAxiosKey, createAxiosClient('Kalon', kalonAxiosKey, window.env.KALON_URL))
  app.provide(moneizAxiosKey, createAxiosClient('Moneiz', moneizAxiosKey, window.env.MONEIZ_URL))

  await vueKeycloak.install(app, {
    config: {
      url: window.env.KEYCLOAK_URL,
      realm: window.env.KEYCLOAK_REALM,
      clientId: window.env.KEYCLOAK_CLIENT_ID
    }
  })

  app.use(initRouter())
  app.mount('#app')
}).catch(error => {
  console.log(error)
  document.body.innerHTML = 'Impossible de charger la configuration'
})
