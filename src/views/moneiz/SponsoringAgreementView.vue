<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { capitalize, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import CardTitle from '@/components/CardTitle.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';
import FloatingFormField from '@/components/FloatingFormField.vue';
import FloatingSelectField from '@/components/FloatingSelectField.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import UiCard from '@/components/UiCard.vue';
import {
  AgreementState,
  agreementStateToString,
} from '@/dto/moneiz/AgreementState';
import type { SponsoringId } from '@/dto/moneiz/SponsoringList';
import { getSponsoring, useManualUpdateAgreementMutation, useSetAgreementStateMutation } from '@/queries/moneiz/sponsorings.queries';
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

const setAgreementStateMutation = useSetAgreementStateMutation();
const manualUpdateAgreementMutation = useManualUpdateAgreementMutation();

const agreementState = ref<AgreementState | undefined>();
const presale = ref<number | undefined>();
const file = ref<File | undefined>();

watch(sponsoring, (sponsoring) => {
  if (sponsoring === undefined) return;
  agreementState.value = sponsoring.agreementState;
  presale.value = sponsoring.presale;
});

const handleStateSubmit = async () => {
  if (currentEventId.value === undefined) return;
  if (agreementState.value === undefined) return;
  await setAgreementStateMutation.mutateAsync({
    eventId: currentEventId.value,
    sponsoringId: sponsoringId,
    agreementState: agreementState.value,
  });
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  file.value = target.files?.[0];
};

const handleManualUpdateSubmit = async () => {
  if (!currentEventId.value) return;
  if (!presale.value) return;

  await manualUpdateAgreementMutation.mutateAsync({
    eventId: currentEventId.value,
    sponsoringId: sponsoringId,
    presale: presale.value,
    file: file.value,
  });
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
            <form class="card-text" @submit.prevent="handleStateSubmit">
              <FloatingSelectField
                id="agreement-state"
                label="Statut"
                class="mb-3"
                v-model="agreementState"
                :disabled="setAgreementStateMutation.isPending.value"
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
                  :disabled="setAgreementStateMutation.isPending.value"
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
            <form @submit.prevent="handleManualUpdateSubmit">
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
                    @change="handleFileChange"
                    :disabled="manualUpdateAgreementMutation.isPending.value"
                  />
                </div>
              </div>
              <FloatingFormField
                id="presale"
                label="Nombre de place en prévente"
                class="mb-3"
              >
                <input
                  type="number"
                  id="presale"
                  class="form-control"
                  min="0"
                  step="1"
                  placeholder="Nombre de place en prévente"
                  v-model="presale"
                  :disabled="manualUpdateAgreementMutation.isPending.value"
                />
              </FloatingFormField>
              <div class="d-flex justify-content-end">
                <button
                  class="btn btn-primary"
                  type="submit"
                  :disabled="manualUpdateAgreementMutation.isPending.value"
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
