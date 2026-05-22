<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
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
