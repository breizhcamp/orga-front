<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import CardTitle from '@/components/CardTitle.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';
import FloatingNumberField from '@/components/FloatingNumberField.vue';
import FloatingSelectField from '@/components/FloatingSelectField.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import UiCard from '@/components/UiCard.vue';
import {
  AgreementState,
  agreementStateToString,
} from '@/dto/moneiz/AgreementState';
import type { SponsoringId } from '@/dto/moneiz/SponsoringList';
import { getSponsoring } from '@/queries/moneiz/sponsorings.queries';
import { useEventStore } from '@/stores/event';

const route = useRoute();
const sponsoringId = route.params.sponsoringId as SponsoringId;

const eventStore = useEventStore();
const { currentEventId } = storeToRefs(eventStore);

const {
  isPending,
  isError,
  error,
  data: sponsoring,
} = getSponsoring(currentEventId, sponsoringId);

const agreementState = ref<AgreementState | undefined>();
const presale = ref<number | undefined>();

watch(sponsoring, (sponsoring) => {
  if (sponsoring === undefined) return;
  agreementState.value = sponsoring.agreementState;
  presale.value = sponsoring.presale;
});

const capitalize = (value: string): string => {
  if (!value) return value;
  const firstLetter = value.charAt(0);
  const remain = value.substring(1);
  return firstLetter.toUpperCase() + remain;
};
</script>

<template>
  <div class="container py-4">
    <LoadingSpinner v-if="isPending" />
    <ErrorAlert
      v-else-if="isError"
      :message="error?.message"
    />
    <ErrorAlert
      v-else-if="sponsoring?.sponsor === undefined"
      message="ce sponsoring n'a pas de sponsor assigné."
    />
    <template v-else>
      <h1 class="mb-4">
        Convention {{ sponsoring?.levelName }} BreizhCamp de {{ sponsoring?.sponsor?.name }}
      </h1>
      <div class="row">
        <div class="col-12 col-xl-6">
          <UiCard class="mb-3">
            <CardTitle>Convention en ligne</CardTitle>
            <form class="card-text" @submit.prevent>
              <FloatingSelectField
                id="agreement-state"
                label="Statut"
                class="mb-3"
                v-model="agreementState"
                required
              >
                <option
                  v-for="state in Object.values(AgreementState)"
                  :value="state"
                  class="text-capitalize"
                  :key="state"
                >
                  {{ capitalize(agreementStateToString[state]) }}
                </option>
              </FloatingSelectField>
              <div class="d-flex justify-content-end">
                <button
                  class="btn btn-primary"
                  type="submit"
               >
                  Enregistrer
                </button>
              </div>
            </form>
          </UiCard>
        </div>
        <div class="col-12 col-xl-6">
          <UiCard class="mb-3">
            <CardTitle>Mise à jour manuelle</CardTitle>
            <form @submit.prevent>
              <div class="row mb-3">
                <div class="col-auto">
                  <label
                    for="input-file"
                    class="col-form-label"
                  >
                    Fichier PDF
                  </label>
                </div>
                <div class="col">
                  <input
                    class="form-control"
                    type="file"
                    id="input-file"
                  />
                </div>
              </div>
              <FloatingNumberField
                id="presale"
                label="Nombre de place en prévente"
                class="mb-3"
                :min="0"
                v-model="presale"
              />
              <div class="d-flex justify-content-end">
                <button
                  class="btn btn-primary"
                  type="submit"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </UiCard>
        </div>
      </div>
    </template>
  </div>
</template>
