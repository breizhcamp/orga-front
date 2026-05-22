<!-- <script setup lang="ts"> -->
<!-- defineProps<{ -->
<!--   name: string; -->
<!-- }>(); -->
<!-- </script> -->
<!---->
<template>
  <div class="dropdown">
    <button
      type="button"
      class="btn btn-sm btn-outline-secondary dropdown-toggle dropdown-toggle-split text-body border-0"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <span class="visually-hidden">Ouvrir le menu</span>
    </button>

    <ul class="dropdown-menu dropdown-menu-end">
      <slot class="foo" />
    </ul>
  </div>
</template>
