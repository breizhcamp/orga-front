<template>
  <div class="card h-100 tile" :class="variantClass">
    <div class="card-body">
      <div class="d-flex align-items-center mb-2">
        <div class="tile-icon me-2" aria-hidden="true">📅</div>
        <h5 class="card-title mb-0">Dates</h5>
      </div>
      <p class="card-text mb-0" v-if="startDate && endDate">
        {{ formattedRange }}
      </p>
      <p class="card-text mb-0" v-else>
        <i>Non défini</i>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDateRange } from '@/utils/dateFormat'

const props = defineProps<{ startDate?: string; endDate?: string; variant?: 'primary' | 'success' | 'info' | 'warning' | 'danger' }>()

const formattedRange = computed(() => formatDateRange(props.startDate, props.endDate))

const variantClass = computed(() => props.variant ? `tile-${props.variant}` : 'tile-default')
</script>

<style scoped>
.card-title { font-weight: 600; }
.tile { border: 0; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.tile-default { background: #ffffff; color: #212529; }
.tile-primary { background: #e8f0ff; color: #052c65; }
.tile-success { background: #e9f7ef; color: #0a3622; }
.tile-info { background: #e7f5ff; color: #055160; }
.tile-warning { background: #fff4e6; color: #664d03; }
.tile-danger { background: #fdecea; color: #58151c; }
.tile-icon { font-size: 1.1rem; }

@media (prefers-color-scheme: dark) {
  .tile { box-shadow: 0 2px 12px rgba(0,0,0,0.3); }
  .tile-default { background: #2b3035; color: #dee2e6; }
  .tile-primary { background: #1a3a5c; color: #cfe2ff; }
  .tile-success { background: #1a4731; color: #d1e7dd; }
  .tile-info { background: #1a4d5c; color: #cff4fc; }
  .tile-warning { background: #5c4a1a; color: #fff3cd; }
  .tile-danger { background: #5c1f28; color: #f8d7da; }
}
</style>
