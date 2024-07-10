<template>
  <div id="session" class="modal show d-block" tabindex="-1" v-if="open" @click="close()" @keyup.stop="closeIfEscape">
    <div class="modal-dialog" @click.stop :class="size? 'modal-' + size : ''">
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
import { defineComponent, type PropType } from 'vue';

export type Size = "sm" | "lg" | "xl";

export default defineComponent({
  name: "ModalInfo",

  props: {
    open: { type: Boolean, required: true, default: false },
    title: { type: String, required: true },
    size: { type: String as PropType<Size>, required: false }
  },

  emits: ['update:open'],

  watch: {
    open() {
      if (this.open) {
        if (document.activeElement != null) {
          (document.activeElement as HTMLElement).blur()
        }
        setTimeout(() =>
          document.getElementById('session')?.focus()
          , 100)
      }
    }
  },

  methods: {
    close() {
      this.$emit('update:open', false)
    },

    closeIfEscape(e: KeyboardEvent) {
      if (e.key == "Escape") {
        this.close()
      }
    }
  }
})
</script>