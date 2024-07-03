import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import KeyCloak from 'keycloak-js'

import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'
import axios from 'axios'

const app = createApp(App)

axios.defaults.baseURL = ''

axios.interceptors.request.use(async config => {
  await app.config.globalProperties.$keycloak.updateToken()
  config.headers.Authorization = `Bearer ${app.config.globalProperties.$keycloak.token}`
  return config
})

const vueCloak = new KeyCloak({
  url: 'https://auth.breizhcamp.org/auth/',
  realm: 'BreizhCamp',
  clientId: 'bilhed-admin-front'
})

const getVueRoute = () => {
  // get URL
  const location = window.location.href;
  // Return '/' without hash  
  if (!location.includes('#')) return '/';

  // Get URL string after hash 
  const start = location.indexOf('#');
  const end = location.length;
  let vueRoute = location.substring(start + 1, end);
  // Check if all keycloak params exist
  // And custom route query should avoid keycloak query
  const keycloakParams = [
    vueRoute.includes('&code'),
    vueRoute.includes('&state'),
    vueRoute.includes('&session_state')
  ];
  const state = keycloakParams.every((item) => item);
  // if state=true, replace URL
  if (state) {
    vueRoute = vueRoute
      .replace(/[&?]code=[^&$]*/, "")
      .replace(/[&?]state=[^&$]*/, "")
      .replace(/[&?]session_state=[^&$]*/, "");
  }
  return vueRoute;
}

vueCloak.init({
  onLoad: 'login-required',
  checkLoginIframe: false
}).then(async () => {
  app.config.globalProperties.$keycloak = vueCloak;
  app.use(router)
  app.mount('#app');
  const vueRoute = getVueRoute();
  await router.push(vueRoute)
})
