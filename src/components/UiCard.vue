<script setup lang="ts">
defineProps<{
  loading?: boolean;
}>();
</script>

<template>
  <div class="card" :aria-hidden="loading">
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>
