import { inject } from 'vue'
import type { AxiosInstance } from 'axios'
import { kalonAxiosKey, moneizAxiosKey } from '@/provide-keys'

function useAxios(key: symbol, clientName: string): AxiosInstance {
  const inst = inject<AxiosInstance>(key)
  if (!inst) {
    console.log(`Client ${clientName} non initialisé`)
    throw new Error(`Client ${clientName} non initialisé`)
  }
  return inst
}

export const useKalon = (): AxiosInstance => useAxios(kalonAxiosKey, 'Kalon')
export const useMoneiz = (): AxiosInstance => useAxios(moneizAxiosKey, 'Moneiz')
