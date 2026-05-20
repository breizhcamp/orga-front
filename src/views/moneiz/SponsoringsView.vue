<script setup lang="ts">
import BiPlus from 'bootstrap-icons/icons/plus-lg.svg?component';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

import SponsoringLine from '@/components/moneiz/SponsoringLine.vue';
import type { LevelList } from '@/dto/moneiz/LevelList';
import type { SponsoringList } from '@/dto/moneiz/SponsoringList';
import type { SponsorList } from '@/dto/moneiz/SponsorList';
import { listLevels } from '@/queries/moneiz/levels.queries';
import { listSponsorings } from '@/queries/moneiz/sponsorings.queries';
import { listSponsors } from '@/queries/moneiz/sponsors.queries';
import { useEventStore } from '@/stores/event';

const eventStore = useEventStore();
const { currentEventId } = storeToRefs(eventStore);
const {
  isPending: isSponsoringsPending,
  isError: isSponsoringsError,
  data: sponsorings,
  error: sponsoringsError,
} = listSponsorings(currentEventId);
const {
  isPending: isLevelPending,
  isError: isLevelError,
  data: levelData,
  error: levelError,
} = listLevels(eventStore.currentEventId);
const {
  isPending: isSponsorsPrending,
  data: sponsors,
} = listSponsors();

const errorMessage = ref<string | null>(null);

const loading = computed(() => isSponsoringsPending.value || isLevelPending.value || isSponsorsPrending.value);
const availableSponsors = computed(() => {
  if (loading.value) return [];
  console.assert(sponsors.value !== undefined);
  console.assert(sponsorings.value !== undefined);
  const availableSponsors = (sponsors.value as SponsorList[]).filter(
    ({ id }) => (sponsorings.value as SponsoringList[]).every(
      ({ sponsor }) => sponsor === undefined || sponsor.id !== id,
    ),
  );
  return availableSponsors;
});

const levels = computed(() => {
  const levelMap = new Map<string, LevelList>();
  levelData.value?.forEach((level) => {
    levelMap.set(level.name, level);
  });
  return levelMap;
});

const handleErrorMessage = (message: string | null) => {
  errorMessage.value = message;
};
</script>

<template>
  <div class="container py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
    <div v-else-if="isSponsoringsError || isLevelError" class="alert alert-danger">
      Erreur: {{ sponsoringsError?.message || levelError?.message }}
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
      <div v-if="errorMessage" class="alert alert-danger">
        Erreur: {{ errorMessage }}
      </div>
      <SponsoringLine
        v-for="sponsoring in sponsorings"
        :key="sponsoring.id"
        :sponsoring="sponsoring"
        :level="levels.get(sponsoring.levelName)"
        :availableSponsors="availableSponsors"
        @error="handleErrorMessage"
      />
    </div>
  </div>
</template>
