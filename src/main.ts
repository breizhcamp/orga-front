import { initRouter } from '@/router';
import { vueKeycloak } from '@josempgon/vue-keycloak';
import { VueQueryPlugin } from '@tanstack/vue-query';

import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'
import { createPinia } from 'pinia';
import { createApp } from 'vue'
import App from './App.vue'
import { createAxiosClient } from './utils/createAxios'
import { kalonAxiosKey, moneizAxiosKey } from './provide-keys'
import { useEventStore } from '@/stores/event'

window.envLoaded.then(async () => {
  const app = createApp(App)
  app.use(VueQueryPlugin)

  // Provide axios instances
  const kalonClient = createAxiosClient('Kalon', kalonAxiosKey, window.env.KALON_URL);
  app.provide(kalonAxiosKey, kalonClient)
  app.provide(moneizAxiosKey, createAxiosClient('Moneiz', moneizAxiosKey, window.env.MONEIZ_URL))

  await vueKeycloak.install(app, {
    config: {
      url: window.env.KEYCLOAK_URL,
      realm: window.env.KEYCLOAK_REALM,
      clientId: window.env.KEYCLOAK_CLIENT_ID
    }
  })

  app.use(createPinia())

  // Initialiser le store d'événements
  const eventStore = useEventStore()
  await eventStore.initializeStore(kalonClient)

  app.use(initRouter())
  app.mount('#app')
}).catch(error => {
  console.log(error)
  document.body.innerHTML = 'Impossible de charger la configuration'
})
