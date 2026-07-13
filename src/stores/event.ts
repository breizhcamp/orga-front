import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

import type { EventId } from '@/dto/kalon/Event.ts';

const LOCAL_STORAGE_KEY = 'orga-current-event';

export const useEventStore = defineStore('event', () => {
  const currentEventId = ref<EventId | undefined>(
    localStorage.getItem(LOCAL_STORAGE_KEY) ?? undefined,
  );

  // Persister l'événement courant dans le localStorage.
  watch(currentEventId, (newCurrentEventId) => {
    if (newCurrentEventId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, newCurrentEventId);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  });

  return {
    currentEventId,
  };
});
