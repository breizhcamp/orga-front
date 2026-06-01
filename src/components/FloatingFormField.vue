<script setup lang="ts">
defineProps<{
  id: string;
  label: string;
  required?: boolean;
}>();
</script>

<template>
  <div class="form-floating">
    <slot />
    <label :for="id">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
  </div>
</template>
