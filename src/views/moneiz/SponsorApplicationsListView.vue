<script setup lang="ts">
import AppTable from '@/components/AppTable.vue';
import SponsorApplicationLine from '@/components/moneiz/SponsorApplicationLine.vue';
import { useSponsorApplications } from '@/queries/moneiz/sponsor-applications.queries';

const {
  data: sponsorApplications,
} = useSponsorApplications();
</script>

<template>
  <div class="container-fluid py-4">
    <AppTable>
      <template #header>
        <th scope="col" class="text-nowrap">Nom de l'entreprise</th>
        <th scope="col">contact</th>
        <th scope="col">Niveau</th>
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
