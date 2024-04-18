<template>
  <slot v-if="pass == 'TWO_DAYS'">2j</slot>
  <slot v-if="pass == 'THREE_DAYS'">3j</slot>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: "PassSlot",

  props: {
    pass: { type: String, required: false },
  },
})
</script>

<style scoped>

</style>