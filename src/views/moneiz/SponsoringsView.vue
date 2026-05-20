<script setup lang="ts">
import BiPlus from 'bootstrap-icons/icons/plus-lg.svg?component';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import SponsoringLine from '@/components/moneiz/SponsoringLine.vue';
import type { LevelList } from '@/dto/moneiz/LevelList';
import { listLevels } from '@/queries/moneiz/levels.queries';
import { listSponsorings } from '@/queries/moneiz/sponsorings.queries';
import { useEventStore } from '@/stores/event';

const eventStore = useEventStore();
const { currentEventId } = storeToRefs(eventStore);
const { isPending, isError, data, error } = listSponsorings(currentEventId);
const {
  isPending: isLevelPending,
  isError: isLevelError,
  data: levelData,
  error: levelError,
} = listLevels(eventStore.currentEventId);

const levels = computed(() => {
  const levelMap = new Map<string, LevelList>();
  levelData.value?.forEach((level) => {
    levelMap.set(level.name, level);
  });
  return levelMap;
});
</script>

<template>
  <div class="container py-4">
    <div v-if="isPending || isLevelPending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
    <div v-else-if="isError || isLevelError" class="alert alert-danger">
      Erreur: {{ error?.message || levelError?.message }}
    </div>
    <div v-else>
      <div class="d-flex justify-content-end mb-4">
        <RouterLink
          :to="{ name: 'SponsoringsCreate' }"
          class="btn btn-primary"
          title="Ajouter des nouveaux slots de sponsorings"
        >
          <BiPlus />
          Ajouter des sponsorings
        </RouterLink>
      </div>
      <SponsoringLine
        v-for="sponsoring in data"
        :key="sponsoring.id"
        :sponsoring="sponsoring"
        :level="levels.get(sponsoring.levelName)"
      />
    </div>
  </div>
</template>
