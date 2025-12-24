<script setup lang="ts">
import { useEventStore } from '@/stores/event.ts';

const eventStore = useEventStore();
</script>

<template>
<div>
  <h1>Dashboard</h1>
  {{eventStore.currentEventId}}
</div>
</template>

<style scoped>

</style>
