import { initRouter } from '@/router';
import { getToken, vueKeycloak } from '@josempgon/vue-keycloak';
import { VueQueryPlugin } from '@tanstack/vue-query';
import axios from 'axios'

import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'

window.envLoaded.then(async () => {
  const app = createApp(App)
  app.use(VueQueryPlugin)

  axios.interceptors.request.use(async config => {
    const token = await getToken()
    config.headers.Authorization = `Bearer ${token}`
    return config
  })

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
