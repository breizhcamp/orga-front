<script setup lang="ts">
import FloatingFormField from './FloatingFormField.vue';

defineProps<{
  id: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
}>();

const model = defineModel<string>({ default: '' });
</script>

<template>
  <FloatingFormField
    :id="id"
    :label="label"
    :required="required"
  >
    <input
      type="text"
      :id="id"
      class="form-control"
      :placeholder="label"
      :disabled="disabled"
      :required="required"
      v-model="model"
    >
  </FloatingFormField>
</template>
