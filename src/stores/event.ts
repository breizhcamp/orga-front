import type { EventSummary } from '@/dto/kalon/Event.ts';
import type { AxiosInstance } from 'axios';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const LOCAL_STORAGE_KEY = 'orga-current-event';

export const useEventStore = defineStore('event', () => {
  const currentEventId = ref<string>()
  const events = ref<EventSummary[]>([])
  const loading = ref<boolean>(false)

  // Persister l'événement courant dans le localStorage
  watch(currentEventId, (newId) => {
    if (newId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, newId)
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  })

  async function loadEvents(kalonClient: AxiosInstance) {
    try {
      loading.value = true

      // Charger la liste des événements
      const response = await kalonClient.get<EventSummary[]>('/events?view=summary')
      events.value = response.data

      // Restaurer ou initialiser l'événement courant
      if (events.value.length > 0) {
        const savedEventId = localStorage.getItem(LOCAL_STORAGE_KEY)

        // Valider que l'ID sauvegardé existe dans la liste
        if (savedEventId && events.value.some(e => e.id === savedEventId)) {
          currentEventId.value = savedEventId
        } else {
          // Sinon prendre le premier événement
          currentEventId.value = events.value[0]?.id
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du store d\'événements:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    currentEventId,
    events,
    loading,
    loadEvents
  }
})
