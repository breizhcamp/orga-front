<script setup lang="ts">
import type { Event } from '@/dto/kalon/Event'
import { useKalon } from '@/utils/useAxios'
import { formatDateRange } from '@/utils/dateFormat'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BiPlus from 'bootstrap-icons/icons/plus-lg.svg?component'

const kalon = useKalon()

const events = ref<Event[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function loadEvents() {
  try {
    loading.value = true
    error.value = null
    const resp = await kalon.get<Event[]>('/events')
    events.value = resp.data
  } catch (e) {
    console.error('Erreur de chargement des événements', e)
    error.value = 'Impossible de charger les événements'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEvents()
})
</script>

<template>
  <div class="container py-3">
    <!-- Header -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body d-flex align-items-center">
        <div class="flex-grow-1">
          <h1 class="h3 mb-1">Événements</h1>
          <p class="text-muted mb-0">Liste de tous les événements</p>
        </div>
        <RouterLink to="/events/new" class="btn btn-primary" title="Créer un nouvel événement">
          <BiPlus class="bi me-1" />
          Créer un événement
        </RouterLink>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="d-flex align-items-center gap-2 mb-4 text-secondary">
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span>Chargement des événements…</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
      <svg class="me-2" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      <div>{{ error }}</div>
    </div>

    <!-- Empty state -->
    <div v-else-if="events.length === 0" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <svg class="mb-3 text-muted" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <h3 class="h5 mb-2">Aucun événement</h3>
        <p class="text-muted mb-3">Commencez par créer votre premier événement</p>
        <RouterLink to="/events/new" class="btn btn-primary">
          <BiPlus class="bi me-1" />
          Créer un événement
        </RouterLink>
      </div>
    </div>

    <!-- Events grid -->
    <div v-else class="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
      <div v-for="event in events" :key="event.id" class="col">
        <RouterLink :to="`/events/${event.id}`" class="text-decoration-none">
          <div class="card h-100 border-0 shadow-sm event-card">
            <div class="card-body">
              <h5 class="card-title mb-2">{{ event.name }}</h5>
              <p class="card-text text-muted mb-0" v-if="event.startDate && event.endDate">
                {{ formatDateRange(event.startDate, event.endDate) }}
              </p>
              <p class="card-text text-muted mb-0" v-else>
                <i>Dates non définies</i>
              </p>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-body {
  padding: 1.5rem;
}

.event-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-title {
  color: var(--bs-body-color);
  font-weight: 600;
}

.bi {
  width: 20px;
  height: 20px;
  vertical-align: middle;
}

/* Responsive button text */
@media (max-width: 576px) {
  .btn-primary span {
    display: none;
  }
}
</style>
