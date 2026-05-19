<script setup lang="ts">
import { computed } from 'vue';

import SponsoringLine from '@/components/moneiz/SponsoringLine.vue';
import type { LevelList } from '@/dto/moneiz/LevelList';
import { listLevels } from '@/queries/moneiz/levels.queries';
import { listSponsorings } from '@/queries/moneiz/sponsorings.queries';
import { useEventStore } from '@/stores/event';

const eventStore = useEventStore();
const { isPending, isError, data, error } = listSponsorings(eventStore.currentEventId);
const { isPending: isLevelPending, isError: isLevelError, data: levelData, error: levelError } = listLevels(eventStore.currentEventId);

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
    <div v-else class="sponsorings-list">
      <SponsoringLine
        v-for="sponsoring in data"
        :key="sponsoring.id"
        :sponsoring="sponsoring"
        :level="levels.get(sponsoring.levelName)"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
