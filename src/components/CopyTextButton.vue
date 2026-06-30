<script lang="ts" setup>
import BiCheckLg from 'bootstrap-icons/icons/check-lg.svg?component';
import BiCopy from 'bootstrap-icons/icons/copy.svg?component';
import { ref } from 'vue';

const COPY_ANIMATION_TIMEOUT_TIME_MS = 1000;

const { text } = defineProps<{
  title: string;
  text: string;
}>();

const copyAnimationTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

const handleClick = async () => {
  await navigator.clipboard.writeText(text);
  if (copyAnimationTimeout.value) {
    clearTimeout(copyAnimationTimeout.value);
  }
  copyAnimationTimeout.value = setTimeout(() => {
    copyAnimationTimeout.value = null;
  }, COPY_ANIMATION_TIMEOUT_TIME_MS);
};
</script>

<template>
  <button
    class="btn btn-sm btn-outline-secondary"
    :title="title"
    :aria-label="title"
    @click="handleClick"
  >
    <BiCopy v-if="!copyAnimationTimeout" />
    <BiCheckLg v-else class="text-success-emphasis" />
  </button>
</template>
