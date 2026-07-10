<script setup lang="ts">
import BiPlus from 'bootstrap-icons/icons/plus-lg.svg?component';
import BiStarFill from 'bootstrap-icons/icons/star-fill.svg?component';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import ErrorAlert from '@/components/ErrorAlert.vue';
import { getDefaultEvent } from '@/queries/kalon/config.queries';
import { listEvents } from '@/queries/kalon/events.queries';
import { formatDateRange } from '@/utils/dateFormat';

const {
  isPending: isEventsPending,
  isError: isEventsError,
  error: errorEvents,
  data: events,
} = listEvents();

const {
  isPending: isDefaultEventPending,
  isError: isDefaultEventError,
  error: errorDefaultEvent,
  data: defaultEvent,
} = getDefaultEvent();

const loading = computed(() => {
  return isEventsPending.value || isDefaultEventPending.value;
});
</script>

<template>
  <div class="container py-3">
    <!-- Header -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body d-flex align-items-center p-4">
        <div class="flex-grow-1">
          <h1 class="h3 mb-1">Événements</h1>
          <p class="text-muted mb-0">Liste de tous les événements</p>
        </div>
        <RouterLink
          :to="{ name: 'EditEvent', params: { eventId: 'new' } }"
          class="btn btn-primary"
          title="Créer un nouvel événement"
        >
          <BiPlus class="bi me-1" />
          Créer un événement
        </RouterLink>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="d-flex align-items-center gap-2 mb-4 text-secondary"
    >
      <span
        class="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      ></span>
      <span>Chargement des événements…</span>
    </div>

    <ErrorAlert
      v-else-if="isEventsError"
      :message="`Impossible de charger les événements : ${errorEvents?.message}`"
    />

    <ErrorAlert
      v-else-if="isDefaultEventError"
      :message="`Impossible de charger l'événement par défaut : ${errorDefaultEvent?.message}`"
    />

    <!-- Empty state -->
    <div v-else-if="events?.length === 0" class="card border-0 shadow-sm">
      <div class="card-body text-center px-4 py-5">
        <svg
          class="mb-3 text-muted"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <h3 class="h5 mb-2">Aucun événement</h3>
        <p class="text-muted mb-3">
          Commencez par créer votre premier événement
        </p>
        <RouterLink
          :to="{ name: 'EditEvent', params: { eventId: 'new' } }"
          class="btn btn-primary"
          title="Créer un nouvel événement"
        >
          <BiPlus class="bi me-1" />
          Créer un événement
        </RouterLink>
      </div>
    </div>

    <!-- Events grid -->
    <div
      v-else
      class="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4"
    >
      <div
        v-for="event in events"
        :key="event.id"
        class="col position-relative"
      >
        <RouterLink
          :to="{ name: 'EditEvent', params: { eventId: event.id } }"
          class="text-decoration-none"
        >
          <div
            class="card h-100 border-0 shadow-sm event-card"
            :data-testid="`event-card-${event.id}`"
          >
            <div class="card-body p-4">
              <h5 class="card-title fw-semibold mb-2 d-flex justify-content-between">
                <span>{{ event.name }}</span>
                <BiStarFill
                  v-if="event.id === defaultEvent?.id"
                  class="text-warning"
                />
              </h5>
              <p
                v-if="event.startDate && event.endDate"
                class="card-text text-muted mb-0"
              >
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
.event-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.bi {
  width: 20px;
  height: 20px;
  vertical-align: middle;
}
</style>
