<script setup lang="ts">
import FloatingFormField from './FloatingFormField.vue';

defineProps<{
  id: string;
  label: string;
  min?: number;
  step?: number;
  disabled?: boolean;
  required?: boolean;
}>();

const model = defineModel<number>();
</script>

<template>
  <FloatingFormField
    :id="id"
    :label="label"
    :required="required"
  >
    <input
      type="number"
      :id="id"
      class="form-control"
      :min="min"
      :step="step"
      :placeholder="label"
      :disabled="disabled"
      :required="required"
      v-model="model"
    />
  </FloatingFormField>
</template>
