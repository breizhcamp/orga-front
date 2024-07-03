<template>
  <div class="alert alert-warning alert-dismissible mt-3" role="alert" v-if="alert.display">
    <div>
      {{ title }}<br>
      <code>{{ alert.content }}</code><br>
      <slot></slot>
    </div>
    <button type="button" class="btn-close" aria-label="Close" @click="$emit('dismiss')"></button>
  </div>
</template>

<script lang="ts">
import type { MonoFieldAlertValues } from '@/dto/Alert';
import { defineComponent, type PropType } from 'vue';


export default defineComponent({
  name: "MonoFieldAlert",
  props: {
    title: { type: String, required: true },
    alert: { type: Object as PropType<MonoFieldAlertValues>, required: true }
  },
  emits: ["dismiss"]
})
</script>