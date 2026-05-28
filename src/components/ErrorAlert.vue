<script setup lang="ts">
import BiExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg?component';

defineProps<{
  message: string | undefined;
}>();
</script>

<template>
  <div class="alert alert-danger d-flex align-items-center" role="alert">
    <BiExclamationTriangleFill class="flex-shrink me-2" />
    <div>
      Erreur : {{ message || 'erreur inconnue' }}
    </div>
  </div>
</template>
