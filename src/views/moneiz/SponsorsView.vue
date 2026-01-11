<script setup lang="ts">
/// <reference types="vite-svg-loader" />

import { listSponsors } from '@/queries/moneiz/sponsors.queries'
import SponsorLine from '@/components/moneiz/SponsorLine.vue'

const { isPending, isError, data, error } = listSponsors()

</script>

<template>
  <div class="container py-4">
    <div class="text-end">
      <router-link class="btn btn-primary mb-3" :to="{ name: 'SponsorEdit', params: { sponsorId: 'new' } }">
        Ajouter un sponsor
      </router-link>
    </div>

    <div v-if="isPending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
    <div v-else-if="isError" class="alert alert-danger">
      Erreur: {{ error?.message }}
    </div>
    <div v-else>
      <SponsorLine v-for="sponsor in data" :key="sponsor.id" :sponsor="sponsor"/>
    </div>
  </div>
</template>

<style scoped>

</style>
