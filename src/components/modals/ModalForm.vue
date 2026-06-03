<script setup lang="ts">
import type { Size } from './ModalInfo.vue';

withDefaults(defineProps<{
  loading?: boolean;
  title: string;
  size?: Size;
  saveButtonText?: string;
  saveButtonVariant?: string;
}>(), {
  loading: false,
  saveButtonText: 'Sauvegarder',
  saveButtonVariant: 'primary',
});

const open = defineModel<boolean>('open', { required: true });

const emit = defineEmits<{
  save: [];
}>();

const close = () => {
  open.value = false;
};

const save = () => {
  emit('save');
};

const closeIfEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close();
  }
};
</script>

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
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="close()">Fermer</button>
            <button type="submit" :class="`btn btn-${saveButtonVariant}`" :disabled="loading" data-testid="modal-save-btn">
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" v-if="loading"></span>
              {{ saveButtonText }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div class="modal-backdrop show" v-if="open"></div>
</template>
