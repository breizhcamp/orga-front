<script setup lang="ts">
defineProps<{
  loading?: boolean;
}>();
</script>

<template>
  <h5 v-if="loading" class="card-title mb-3 placeholder-glow">
    <span class="placeholder col-4"></span>
  </h5>
  <h5 v-else class="card-title mb-3">
    <slot />
  </h5>
</template>
