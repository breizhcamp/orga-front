<script setup lang="ts">
/// <reference types="vite-svg-loader" />

import { useSponsorFiles } from '@/queries/moneiz/sponsor-files';
import { listSponsors } from '@/queries/moneiz/sponsors.queries';
import BiPen from 'bootstrap-icons/icons/pen.svg?component'
import { computed } from 'vue';

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
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="isError" class="alert alert-danger">
      Error: {{ error?.message }}
    </div>
    <div v-else class="sponsors-grid">
      <div class="card sponsor-card h-100" v-for="sponsor in data" :key="sponsor.id">
        <div class="logo-container">
          <div v-if="isLoadingLogos && !logoUrls.get(sponsor.id)" class="text-muted">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading logo...</span>
            </div>
          </div>
          <img
            v-else-if="logoUrls.get(sponsor.id)"
            :src="logoUrls.get(sponsor.id)"
            :alt="sponsor.name"
            class="sponsor-logo"
          >
          <div v-else class="text-muted small">No logo</div>
        </div>
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title mb-0 flex-grow-1">{{ sponsor.name }}</h5>
            <router-link :to="'/moneiz/sponsors/' + sponsor.id" class="btn btn-sm btn-primary ms-2" title="Edit sponsor">
              <BiPen />
            </router-link>
          </div>
          <a v-if="sponsor.url" :href="sponsor.url" target="_blank" class="card-link text-decoration-none small mt-auto">
            Visit website
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sponsors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1400px;
}

.sponsor-card {
  max-width: 200px;
}

.sponsor-card {
  transition: all 0.3s ease;
  border-radius: 0.5rem;
  overflow: hidden;
  justify-self: start;
}

.sponsor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.sponsor-logo {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}
</style>
