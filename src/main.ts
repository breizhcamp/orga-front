import { initRouter } from '@/router';
import Keycloak from 'keycloak-js';
import { VueQueryPlugin } from '@tanstack/vue-query';

import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/styles/main.scss'
import { createPinia } from 'pinia';
import { createApp } from 'vue'
import App from './App.vue'
import { createAxiosClient } from './utils/createAxios'
import { kalonAxiosKey, moneizAxiosKey } from './provide-keys'
import { useEventStore } from '@/stores/event'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/fr'

window.envLoaded.then(async () => {
  const app = createApp(App)
  app.use(VueQueryPlugin)

  // Activer la locale française pour Dayjs
  dayjs.extend(localizedFormat)
  dayjs.locale('fr')

  const keycloak = new Keycloak({
    url: window.env.KEYCLOAK_URL,
    realm: window.env.KEYCLOAK_REALM,
    clientId: window.env.KEYCLOAK_CLIENT_ID,
  });
  try {
      await keycloak.init({
        onLoad: 'login-required',
      });
      console.assert(keycloak.authenticated, 'The user is not authenticated');
  } catch (error) {
      console.error('Failed to initialize Keycloak adapter:', error);
  }

  // Provide axios instances
  const kalonClient = createAxiosClient('Kalon', kalonAxiosKey, keycloak, window.env.KALON_URL);
  app.provide(kalonAxiosKey, kalonClient);
  const moneizClient = createAxiosClient('Moneiz', moneizAxiosKey, keycloak, window.env.MONEIZ_URL);
  app.provide(moneizAxiosKey, moneizClient);

  app.use(createPinia())

  // Initialiser le store d'événements
  const eventStore = useEventStore()
  await eventStore.loadEvents(kalonClient)

  app.use(initRouter())
  app.mount('#app')
}).catch((error: unknown) => {
  console.log(error)
  document.body.innerHTML = 'Impossible de charger la configuration'
})
