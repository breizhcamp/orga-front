<script setup lang="ts">
import FloatingFormField from './FloatingFormField.vue';

defineProps<{
  id: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
}>();

const model = defineModel();
</script>

<template>
  <FloatingFormField
    :id="id"
    :label="label"
    :required="required"
  >
    <select
      :id="id"
      class="form-select"
      :disabled="disabled"
      :required="required"
      v-model="model"
    >
      <slot />
    </select>
  </FloatingFormField>
</template>
