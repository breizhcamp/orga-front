<script setup lang="ts">
defineProps<{
  loading?: boolean;
  placeholderClass?: string;
}>();
</script>

<template>
  <p v-if="loading" class="card-text placeholder-glow">
    <span
      class="placeholder"
      :class="placeholderClass ?? 'col-6'"
    />
  </p>
  <p v-else class="card-text">
    <slot />
  </p>
</template>
