<template>
  <div class="card h-100 tile" :class="variantClass">
    <div class="card-body">
      <div class="d-flex align-items-center mb-2">
        <div class="tile-icon me-2" aria-hidden="true">📍</div>
        <h5 class="card-title mb-0">Lieu</h5>
      </div>
      <p class="card-text mb-0" v-if="venue && venue.trim().length">
        {{ venue }}
      </p>
      <p class="card-text mb-0" v-else>
        <i>Non défini</i>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ venue?: string; variant?: 'primary' | 'success' | 'info' | 'warning' | 'danger' }>()
const variantClass = computed(() => props.variant ? `tile-${props.variant}` : 'tile-default')
</script>

<style scoped>
.card-title { font-weight: 600; }
.tile { border: 0; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.tile-default { background: #ffffff; }
.tile-primary { background: #e8f0ff; }
.tile-success { background: #e9f7ef; }
.tile-info { background: #e7f5ff; }
.tile-warning { background: #fff4e6; }
.tile-danger { background: #fdecea; }
.tile-icon { font-size: 1.1rem; }
</style>
