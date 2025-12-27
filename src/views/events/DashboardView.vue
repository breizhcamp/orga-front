<script setup lang="ts">
import BiPencil from "bootstrap-icons/icons/pencil.svg?component";
import { useEventStore } from '@/stores/event.ts';
import { onMounted, ref, watch } from 'vue'
import { useKalon } from '@/utils/useAxios'
import EventDateTile from '@/components/dashboard/EventDateTile.vue'
import EventVenueTile from '@/components/dashboard/EventVenueTile.vue'
import { RouterLink } from 'vue-router'
import type { Event } from '@/dto/kalon/Event.ts'

const eventStore = useEventStore();
const kalon = useKalon()

const event = ref<Event | undefined>()
const loading = ref(false)

async function loadEvent() {
  const id = eventStore.currentEventId
  if (!id) {
    event.value = undefined
    return
  }
  try {
    loading.value = true
    const resp = await kalon.get<Event>(`/events/${id}`)
    event.value = resp.data
  } catch (e) {
    console.error('Erreur de chargement de l\'évènement', e)
    event.value = undefined
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEvent()
})

watch(() => eventStore.currentEventId, () => {
  loadEvent()
})
</script>

<template>
  <div class="container py-3">
    <!-- Header / Hero -->
    <div v-if="event" class="card border-0 shadow-sm mb-4 hero hero-colored">
      <div class="card-body d-flex align-items-center">
        <div class="flex-grow-1">
          <h1 class="hero-title mb-1 text-white">{{ event.name }}</h1>
          <p class="text-white-50 mb-0">Vue d'ensemble de l'évènement</p>
        </div>
        <RouterLink :to="`/events/${event.id}`" class="icon-link me-2" aria-label="Modifier l'évènement" title="Modifier l'évènement">
          <BiPencil />
        </RouterLink>
        <a
          v-if="event.website"
          :href="event.website"
          class="icon-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ouvrir le site de l'évènement"
          title="Ouvrir le site de l'évènement"
        >
          <!-- Inline SVG globe icon -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z" stroke="#ffffff" stroke-width="1.5"/>
            <path d="M3.5 9.5h17M3.5 14.5h17" stroke="#ffffff" stroke-width="1.2"/>
            <path d="M12 2.5c-3 3-4.5 6.5-4.5 9.5s1.5 6.5 4.5 9.5c3-3 4.5-6.5 4.5-9.5S15 5.5 12 2.5Z" stroke="#ffffff" stroke-width="1.2"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="d-flex align-items-center gap-2 mb-4 text-secondary">
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span>Chargement du tableau de bord…</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="!event" class="card border-0 shadow-sm mb-4">
      <div class="card-body d-flex flex-column flex-md-row align-items-md-center gap-3">
        <div class="flex-grow-1">
          <h2 class="h5 mb-1">Aucun évènement courant</h2>
          <p class="text-muted mb-3 mb-md-0">Créez-en un nouveau.</p>
        </div>
        <div class="d-flex gap-2">
          <RouterLink class="btn btn-primary" to="/events/new">Créer un nouvel évènement</RouterLink>
        </div>
      </div>
    </div>

    <!-- Tiles grid -->
    <div v-if="event" class="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-4">
      <div class="col">
        <div class="tile-card">
          <EventDateTile :start-date="event.startDate" :end-date="event.endDate" variant="primary" />
        </div>
      </div>
      <div class="col">
        <div class="tile-card">
          <EventVenueTile :venue="event.venue" variant="success" />
        </div>
      </div>
      <!-- Emplacements pour futures tuiles -->
      <div class="col placeholder-tile">
        <div class="card h-100 border-0 dashed tile-card">
          <div class="card-body d-flex align-items-center justify-content-center text-muted">
            <small>Tuile à venir</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hero tweaks */
.hero { background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%); }
.hero-colored { background: linear-gradient(135deg, #0d6efd 0%, #4dabf7 60%, #74c0fc 100%); }
.hero-title { font-weight: 700; }

/* Icon-only link for website */
.icon-link {
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #ffffff40;
  background-color: transparent;
  transition: box-shadow .2s ease, transform .1s ease;
}
.icon-link:hover {
  box-shadow: 0 2px 8px rgba(255,255,255,0.35);
  transform: translateY(-1px);
}

/* Placeholder tile for future content */
.dashed { border: 2px dashed #e9ecef; }

/* Harmonize spacing in cards */
.card-body { padding: 1rem 1.25rem; }

/* Make tiles a bit narrower visually */
.tile-card > .card,
.tile-card { max-width: 320px; margin-inline: auto; }
</style>
