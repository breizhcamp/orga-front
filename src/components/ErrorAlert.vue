<script setup lang="ts">
import BiExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg?component';
</script>

<template>
  <div class="alert alert-danger d-flex align-items-center" role="alert">
    <BiExclamationTriangleFill class="flex-shrink me-2" />
    <div>
      <slot />
    </div>
  </div>
</template>
