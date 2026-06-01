import '@/assets/styles/main.scss';
import 'dayjs/locale/fr';

import { VueQueryPlugin } from '@tanstack/vue-query';
// We need to import Popover for the dropdown menu to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Popover } from 'bootstrap';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import Keycloak from 'keycloak-js';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import { initRouter } from '@/router';
import { useEventStore } from '@/stores/event';

import App from './App.vue';
import { kalonAxiosKey, moneizAxiosKey } from './provide-keys';
import { createAxiosClient } from './utils/createAxios';

window.envLoaded.then(async () => {
  const app = createApp(App);
  app.use(VueQueryPlugin);

  // Activer la locale française pour Dayjs
  dayjs.extend(localizedFormat);
  dayjs.locale('fr');

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

  app.use(createPinia());

  // Initialiser le store d'événements
  const eventStore = useEventStore();
  await eventStore.loadEvents(kalonClient);

  app.use(initRouter());
  app.mount('#app');
}).catch((error: unknown) => {
  console.log(error);
  document.body.innerHTML = 'Impossible de charger la configuration';
});
