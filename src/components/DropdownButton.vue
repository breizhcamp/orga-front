<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue';

defineOptions({
  inheritAttrs: false,
});

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {}
defineProps<Props>();
</script>

<template>
  <li>
    <button
      class="dropdown-item"
      type="button"
      v-bind="$attrs"
    >
      <slot />
    </button>
  </li>
</template>
