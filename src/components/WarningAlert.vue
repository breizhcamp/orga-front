<script setup lang="ts">
import BiExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg?component';
</script>

<template>
  <div class="alert alert-warning d-flex align-items-center" role="alert">
    <BiExclamationTriangleFill class="flex-shrink me-2" />
    <div>
      <strong class="me-2">Attention !</strong>
      <slot />
    </div>
  </div>
</template>
