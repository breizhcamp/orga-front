<script setup lang="ts">
import FloatingFormField from './FloatingFormField.vue';

defineProps<{
  id: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
}>();

const model = defineModel<string>({ required: true });
</script>

<template>
  <FloatingFormField
      :id="id"
      :label="label"
      :required="required"
  >
    <textarea
      :id="id"
      class="form-control h-100"
      :placeholder="label"
      :disabled="disabled"
      :required="required"
      v-model="model"
    ></textarea>
  </FloatingFormField>
</template>
