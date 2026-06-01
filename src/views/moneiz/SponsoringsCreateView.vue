<script setup lang="ts">
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import ErrorAlert from '@/components/ErrorAlert.vue';
import FloatingFormField from '@/components/FloatingFormField.vue';
import FloatingSelectField from '@/components/FloatingSelectField.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import UiCard from '@/components/UiCard.vue';
import { listLevels } from '@/queries/moneiz/levels.queries';
import { useCreateSponsoringsMutation } from '@/queries/moneiz/sponsorings.queries';
import { useEventStore } from '@/stores/event';

const eventStore = useEventStore();
const { currentEventId } = storeToRefs(eventStore);
console.assert(currentEventId.value !== undefined);

const router = useRouter();

const {
  data: levels,
  isPending: isLevelsPending,
  isError: isLevelsError,
  error: levelsError,
} = listLevels(currentEventId);
const createSponsoringsMutation = useCreateSponsoringsMutation();

const selectedLevel = ref<string | null>(null);
const numberSlots = ref<number>(1);
const errorMessage = ref<string | null>(null);
const disabled = computed(() => createSponsoringsMutation.isPending.value);

watch(levels, (newLevels) => {
  if (newLevels?.[0] !== undefined && selectedLevel.value === null) {
    selectedLevel.value = newLevels[0].name;
  }
}, { immediate: true });

const handleSubmit = async () => {
  if (selectedLevel.value === null) return;

  errorMessage.value = null;
  try {
    await createSponsoringsMutation.mutateAsync({
      eventId: currentEventId.value!,
      createSponsoringsReq: {
        level: selectedLevel.value,
        numberSlots: numberSlots.value,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.message;
    } else if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      throw error;
    }
    return;
  }
  await router.push({ name: 'Sponsorings' });
};
</script>

<template>
  <div class="container py-4">
    <h1 class="mb-3">Création de sponsorings</h1>
    <LoadingSpinner v-if="isLevelsPending" />
    <ErrorAlert v-else-if="isLevelsError" :message="levelsError?.message" />
    <template v-else>
      <ErrorAlert v-if="errorMessage !== null" :message="errorMessage" />
      <form @submit.prevent="handleSubmit">
        <UiCard class="mb-3">
          <FloatingSelectField
            id="level"
            label="Niveau"
            class="mb-3"
            v-model="selectedLevel"
            :disabled="disabled"
            required
          >
              <option
                v-for="level in levels"
                :value="level.name"
                :key="level.name"
              >
                {{ level.name }}
              </option>
          </FloatingSelectField>

          <FloatingFormField
            id="number-slots"
            label="Nombre de slots"
            required
          >
            <input
              id="number-slots"
              placeholder="Nombre de slots"
              :min="1"
              :step="1"
              v-model="numberSlots"
              :disabled="disabled"
              required
            />
          </FloatingFormField>
        </UiCard>

        <div class="d-flex justify-content-end">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="disabled"
          >
            Créer
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
