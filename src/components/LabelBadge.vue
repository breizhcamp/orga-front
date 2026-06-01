<script setup lang="ts">
defineProps<{
  label: string;
  color: 'primary' | 'secondary' | 'info' | 'warning' | 'danger' | 'success' | 'orange' | 'purple';
}>();
</script>

<template>
  <div
    class="badge rounded-pill text-uppercase"
    :class="`text-bg-${color}`"
  >
    {{ label }}
  </div>
</template>
