<script setup lang="ts">
/// <reference types="vite-svg-loader" />

import { useSponsorFiles } from '@/queries/moneiz/sponsor-files';
import { listSponsors } from '@/queries/moneiz/sponsors.queries';
import { computed } from 'vue';
import SponsorLine from '@/components/moneiz/SponsorLine.vue'

const { isPending, isError, data, error } = listSponsors()

const files = computed(() =>
  data.value?.filter(s => s.logo).map(s => ({ sponsorId: s.id, fileId: s.logo! })) || []
)
const { filesUrls: logoUrls, isLoading: isLoadingLogos } = useSponsorFiles(files)

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
      <SponsorLine v-for="sponsor in data" :key="sponsor.id" :sponsor="sponsor" :logo-url="logoUrls.get(sponsor.id)" :is-loading-logo="isLoadingLogos"/>
    </div>
  </div>
</template>

<style scoped>

</style>
