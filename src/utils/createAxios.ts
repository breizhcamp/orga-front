import type Keycloak from 'keycloak-js';
import type { AxiosHeaders, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import type { InjectionKey } from 'vue'

const attachGlobalInterceptor = (instance: AxiosInstance, keycloak: Keycloak) => {
  instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    await keycloak.updateToken();
    const token = keycloak.token || '';
    const headers = config.headers as AxiosHeaders
    if (typeof headers.set === 'function') {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return config
  })
}

const attachBlockingIfMissingBaseUrl = (instance: AxiosInstance, name: string, baseURL?: string) => {
  if (baseURL) return;

  console.log(`${name} baseURL manquante, tous les appels seront bloqués`)
  instance.interceptors.request.use(() => {
    return Promise.reject(new Error(`${name} baseURL manquante`))
  })
}

export const createAxiosClient = (
  name: string,
  _key: InjectionKey<AxiosInstance> | symbol,
  keycloak: Keycloak,
  baseURL?: string,
): AxiosInstance => {
  const client = axios.create({baseURL})
  attachBlockingIfMissingBaseUrl(client, name, baseURL)
  attachGlobalInterceptor(client, keycloak)
  return client
}
