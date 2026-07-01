<script setup lang="ts">

import BiPlusLg from 'bootstrap-icons/icons/plus-lg.svg?component';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

import ErrorAlert from '@/components/ErrorAlert.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import SponsoringLine from '@/components/moneiz/SponsoringLine.vue';
import type { LevelList } from '@/dto/moneiz/LevelList';
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
  const availableSponsors = sponsors.value!.filter(
    ({ id }) => sponsorings.value!.every(
      ({ sponsor }) => sponsor?.id !== id,
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
  <div class="container-fluid py-4">
    <LoadingSpinner v-if="loading" />
    <ErrorAlert
      v-else-if="isSponsoringsError || isLevelError"
      :message="sponsoringsError?.message || levelError?.message"
    />
    <div
      v-else-if="sponsorings?.length === 0"
      class="d-flex flex-column align-items-center"
    >
      <p>Aucun slot de sponsoring n'a été créé.</p>
      <RouterLink
        :to="{ name: 'SponsoringsCreate' }"
        class="btn btn-primary"
        title="Ajouter des nouveaux slots de sponsorings"
      >
        <BiPlusLg />
        Ajouter des sponsorings
      </RouterLink>
    </div>
    <div v-else>
      <div class="d-flex justify-content-end mb-4">
        <RouterLink
          :to="{ name: 'SponsoringsCreate' }"
          class="btn btn-primary"
          title="Ajouter des nouveaux slots de sponsorings"
        >
          <BiPlusLg />
          Ajouter des sponsorings
        </RouterLink>
      </div>
      <ErrorAlert v-if="errorMessage" :message="errorMessage" />

      <div
        class="overflow-x-auto overflow-y-hidden"
        style="padding-bottom: 150px;"
      >
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th scope="col" aria-label="Niveau"></th>
              <th scope="col">Nom</th>
              <th scope="col">Statut</th>
              <th scope="col">Stand</th>
              <th scope="col">Tickets</th>
              <th scope="col" aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            <SponsoringLine
              v-for="sponsoring in sponsorings"
              :key="sponsoring.id"
              :eventId="currentEventId!"
              :sponsoring="sponsoring"
              :level="levels.get(sponsoring.levelName)"
              :availableSponsors="availableSponsors"
              @error="handleErrorMessage"
            />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
