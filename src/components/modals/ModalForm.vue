<template>
  <div class="modal show d-block" role="dialog" tabindex="-1" v-if="open" @click="close()" @keyup.stop="closeIfEscape">
    <div class="modal-dialog" @click.stop :class="size? 'modal-' + size : ''">
      <div class="modal-content">
        <form @submit.prevent="save()">
          <div class="modal-header">
            <h1 class="modal-title fs-3">{{title}}</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="close()"></button>
          </div>

          <div class="modal-body">
            <slot></slot>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="close()">Close</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" v-if="loading"></span>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div class="modal-backdrop show" v-if="open"></div>
</template>

<script lang="ts">
import {defineComponent, type PropType} from 'vue'
import type { Size } from './ModalInfo.vue';

export default defineComponent({
  name: 'ModalForm',

  props: {
    open: {type: Boolean, required: true, default: false},
    loading: {type: Boolean, default: false},
    title: {type: String, required: true},
    size: { type: String as PropType<Size>, required: false }
  },

  emits: ['update:open', 'save'],

  methods: {
    close() {
      this.$emit('update:open', false)
    },

    save() {
      this.$emit('save')
    },

    closeIfEscape(e: KeyboardEvent) {
      if (e.key == "Escape") {
        this.close()
      }
    }
  }
})
</script>