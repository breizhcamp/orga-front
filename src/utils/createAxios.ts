import { getToken } from '@josempgon/vue-keycloak'
import type { AxiosHeaders, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import type { InjectionKey } from 'vue'

const attachGlobalInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await getToken()
    const headers = config.headers as AxiosHeaders
    if (headers && typeof headers.set === 'function') {
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

export const createAxiosClient = (name: string, _key: InjectionKey<AxiosInstance> | symbol, baseURL?: string): AxiosInstance => {
  const client = axios.create({baseURL})
  attachBlockingIfMissingBaseUrl(client, name, baseURL)
  attachGlobalInterceptor(client)
  return client
}

