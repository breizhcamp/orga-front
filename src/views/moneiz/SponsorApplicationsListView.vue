<script setup lang="ts">
import { storeToRefs } from 'pinia';

import AppTable from '@/components/AppTable.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import SponsorApplicationLine from '@/components/moneiz/SponsorApplicationLine.vue';
import {
  useSponsorApplications,
} from '@/queries/moneiz/sponsor-applications.queries';
import { useEventStore } from '@/stores/event';

const eventStore = useEventStore();
const { currentEventId } = storeToRefs(eventStore);

const {
  isPending: isSponsorApplicationsPending,
  isError: isSponsorApplicationsError,
  error: sponsorApplicationsError,
  data: sponsorApplications,
} = useSponsorApplications(currentEventId);
</script>

<template>
  <div class="container-fluid py-4">
    <LoadingSpinner v-if="isSponsorApplicationsPending" />
    <ErrorAlert
      v-else-if="isSponsorApplicationsError"
      :message="sponsorApplicationsError?.message"
    />
    <p v-else-if="!sponsorApplications" class="text-center">
      Aucune demande de sponsoring
    </p>
    <AppTable v-else>
      <template #header>
        <th scope="col" class="text-nowrap">Date</th>
        <th scope="col" class="text-nowrap">Nom de l'entreprise</th>
        <th scope="col">contact</th>
        <th scope="col">Niveau</th>
        <th scope="col">Informations supplémentaires</th>
        <th scope="col"></th>
      </template>
      <template #body>
        <SponsorApplicationLine
          v-for="sponsorApplication in sponsorApplications"
          :sponsorApplication="sponsorApplication"
          :key="sponsorApplication.id"
        />
      </template>
    </AppTable>
  </div>
</template>
