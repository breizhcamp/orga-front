<template>
  <div class="modal show d-block" tabindex="-1" v-if="open" @click="close()">
    <div class="modal-dialog" @click.stop>
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{title}}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="close()"></button>
        </div>

        <div class="modal-body">
          <slot></slot>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="close()">Close</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop show" v-if="open" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: "ModalInfo",

  props: {
    open: { type: Boolean, required: true, default: false },
    title: { type: String, required: true }
  },

  emits: ['update:open'],

  methods: {
    close() {
      this.$emit('update:open', false)
    }
  }
})
</script>