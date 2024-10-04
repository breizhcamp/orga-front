import { VueQueryPlugin } from '@tanstack/vue-query';
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Keycloak, { type KeycloakConfig } from 'keycloak-js'

import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'
import axios from 'axios'
import { keycloakKey } from './provide-keys'

const app = createApp(App)
app.use(VueQueryPlugin)

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_AUTHORIZATION_ENDPOINT,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
} as KeycloakConfig;

const keycloak = new Keycloak(keycloakConfig)

axios.defaults.baseURL = ''

axios.interceptors.request.use(async config => {
  await keycloak.updateToken(5)
  config.headers.Authorization = `Bearer ${keycloak.token}`
  return config
})

keycloak.init({
  onLoad: "login-required",
  silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
  checkLoginIframe: false,
  responseMode: "query"
}).then(async () => {
  app.provide(keycloakKey, keycloak);
  app.use(router)
  app.mount('#app');
})
