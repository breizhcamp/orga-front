<script setup lang="ts">
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

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
  error: levelsError,
} = listLevels(currentEventId);
const createSponsoringsMutation = useCreateSponsoringsMutation();

const selectedLevel = ref<string | null>(null);
const numberSlots = ref<number>(1);
const errorMessage = ref<string | null>(null);
const disabled = computed(() => createSponsoringsMutation.isPending.value);

watch(levels, (newLevels) => {
  if (newLevels !== undefined && newLevels[0] !== undefined && selectedLevel.value === null) {
    selectedLevel.value = newLevels[0].name;
  }
}, { immediate: true });

const handleSubmit = async () => {
  if (selectedLevel.value === null) return;

  errorMessage.value = null;
  try {
    await createSponsoringsMutation.mutateAsync({
      eventId: currentEventId.value as string,
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
  <div class="container mt-4">
    <h1>Création de sponsorings</h1>
    <div v-if="isLevelsPending" class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement des niveaux...</span>
      </div>
    </div>

    <div v-else-if="levelsError" class="alert alert-danger">
      Erreur: {{ levelsError?.message }}
    </div>

    <div v-else>
      <div v-if="errorMessage !== null" class="alert alert-danger">
        Erreur: {{ errorMessage }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="level" class="form-label">Niveau</label>
          <select
            id="level"
            class="form-select"
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
          </select>
        </div>

        <div class="mb-3">
          <label for="number-slots" class="form-label">Nombre de slots</label>
          <input
            id="number-slots"
            type="number"
            class="form-control"
            min="1"
            step="1"
            v-model.number="numberSlots"
            :disabled="disabled"
            required
          />
        </div>

        <div class="mb-3">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="disabled"
          >
            Créer
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
