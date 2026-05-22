<script setup lang="ts">
import { type RouterLinkProps } from 'vue-router';

defineProps<{
  to: RouterLinkProps['to'];
}>();
</script>

<template>
  <li draggable="false">
    <RouterLink :to="to" class="dropdown-item" draggable="false">
      <slot />
    </RouterLink>
  </li>
</template>

<style lang="css" scoped>
.dropdown-item {
  user-select: none;
}
</style>
