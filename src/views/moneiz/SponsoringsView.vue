<script setup lang="ts">
import { listSponsorings } from '@/queries/moneiz/sponsorings.queries'
import { useEventStore } from '@/stores/event';

const eventStore = useEventStore()
const { isPending, isError, data, error } = listSponsorings(eventStore.currentEventId)

</script>

<template>
  <div class="container py-4">
    <div v-if="isPending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
    <div v-else-if="isError" class="alert alert-danger">
      Erreur: {{ error?.message }}
    </div>
    <div v-else>
      <div v-for="sponsoring in data" :key="sponsoring.id">
        {{ sponsoring.levelName }} - {{ sponsoring.sponsor.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
