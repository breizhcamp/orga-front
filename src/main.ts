import { initRouter } from '@/router';
import { getToken, vueKeycloak } from '@josempgon/vue-keycloak';
import { VueQueryPlugin } from '@tanstack/vue-query';
import axios from 'axios'

import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(VueQueryPlugin)

axios.defaults.baseURL = ''

axios.interceptors.request.use(async config => {
  const token = await getToken()
  config.headers.Authorization = `Bearer ${token}`
  return config
})

await vueKeycloak.install(app, {
  config: {
    url: import.meta.env.VITE_KEYCLOAK_AUTHORIZATION_ENDPOINT,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
  }
})

app.use(initRouter())
app.mount('#app')
