<script lang="ts" setup>
import { Modal } from 'bootstrap';
import { onMounted, ref } from 'vue';

defineProps<{
  name: string;
}>();

const modalElement = ref<HTMLDivElement | null>(null);
let modal: Modal | null = null;

const show = () => {
  modal?.show();
};

const close = () => {
  modal?.hide();
};

defineExpose({
  show,
  close,
});

onMounted(() => {
  if (modalElement.value === null) {
    throw new Error('modalElement is null');
  }
  modal = new Modal(modalElement.value);
});
</script>

<template>
  <div
    class="modal fade"
    tabindex="-1"
    ref="modalElement"
    aria-hidden="true"
    :aria-labelledby="`${name}-modal-title`"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div v-if="$slots.title" class="modal-header">
          <h5 :id="`${name}-modal-title`" class="modal-title">
            <slot name="title" />
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="close"
            aria-label="Fermer"
          ></button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="close"
            >
              Fermer
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
