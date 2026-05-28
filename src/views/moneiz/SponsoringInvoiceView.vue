<script setup lang="ts">
import { Temporal } from '@js-temporal/polyfill';
import BiPlusLg from 'bootstrap-icons/icons/plus-lg.svg?component';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import ErrorAlert from '@/components/ErrorAlert.vue';
import FloatingDateField from '@/components/FloatingDateField.vue';
import FloatingNumberField from '@/components/FloatingNumberField.vue';
import FloatingSelectField from '@/components/FloatingSelectField.vue';
import FloatingTextareaField from '@/components/FloatingTextareaField.vue';
import FloatingTextField from '@/components/FloatingTextField.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import UiCard from '@/components/UiCard.vue';
import { InvoiceType } from '@/dto/moneiz/InvoiceType';
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

const reference = ref<string>('');
const creationDate = ref<string>(Temporal.Now.plainDateISO().toString());
const invoiceName = ref<string>('');
const address = ref<string>('');
const location = ref<string>('');
const vatId = ref<string>('');
const siret = ref<string>('');
const type = ref<InvoiceType>(InvoiceType.INVOICE);

watch(sponsoring, (sponsoring) => {
  if (sponsoring === undefined) return;
  if (sponsoring.sponsor === undefined) return;
  invoiceName.value = sponsoring.sponsor.invoiceName ?? '';
  address.value = sponsoring.sponsor.address ?? '';
  vatId.value = sponsoring.sponsor.vatId ?? '';
  siret.value = sponsoring.sponsor.siret ?? '';
}, { immediate: true });

const handleAddLine = () => {
  console.log('TODO: add line');
};
</script>

<template>
  <div class="container py-4">
    <LoadingSpinner v-if="isPending" />
    <ErrorAlert v-else-if="isError" :message="error?.message" />
    <ErrorAlert
      v-else-if="sponsoring?.sponsor === undefined"
      message="ce sponsoring n'a pas de sponsor assigné."
    />
    <template v-else>
      <h1 class="mb-4">
        Facture
        {{ sponsoring?.sponsor?.invoiceName ?? sponsoring?.sponsor?.name }}
      </h1>
      <form @submit.prevent>
        <UiCard class="mb-3">
          <div class="row">
            <div class="col-12 col-lg-6 mb-3 mb-lg-0">
              <div class="row mb-3">
                <div class="col-6">
                  <FloatingTextField
                    id="reference"
                    label="Reférence"
                    v-model="reference"
                    required
                  />
                </div>
                <div class="col-6">
                  <FloatingDateField
                    id="creation-date"
                    label="Date de création"
                    v-model="creationDate"
                    required
                  />
                </div>
              </div>
              <FloatingTextField
                id="invoice-name"
                label="Raison sociale"
                v-model="invoiceName"
                class="mb-3"
                required
              />
              <FloatingTextareaField
                id="address"
                label="Adresse"
                class="mb-3"
                required
                style="height: 132px;"
                v-model="address"
              />
              <FloatingTextField
                id="todo"
                label="Service"
              />
            </div>
            <div class="col-12 col-lg-6">
              <FloatingTextField
                id="location"
                label="Localité"
                class="mb-3"
                v-model="location"
                required
              />
              <FloatingTextField
                id="todo"
                label="N° de bon de commande"
                class="mb-3"
              />
              <FloatingTextField
                id="vat-id"
                label="Numéro de TVA"
                class="mb-3"
                v-model="vatId"
              />
              <FloatingTextField
                id="siret"
                label="SIRET"
                class="mb-3"
                v-model="siret"
                required
              />
              <FloatingSelectField
                id="type"
                label="Type"
                v-model="type"
                required
              >
                <option :value="InvoiceType.QUOTE">Devis</option>
                <option :value="InvoiceType.INVOICE">Facture</option>
              </FloatingSelectField>
            </div>
          </div>
        </UiCard>
        <UiCard class="mb-3">
          <div class="row mb-3">
            <div class="col">
              <FloatingTextField
                id="description"
                label="Description"
                required
              />
            </div>
            <div class="col-6 col-sm-7 col-md-5 col-lg-4 col-xl-3">
              <div class="input-group">
                <FloatingNumberField
                  id="amount"
                  label="Montant"
                  required
                />
                <span class="input-group-text">€ HT</span>
              </div>
            </div>
            <div class="col-1 d-flex align-items-center justify-content-end">
              <button
                class="btn-close"
                title="Supprimer la ligne"
              />
            </div>
          </div>
          <div class="row mb-3">
            <div class="col" />
            <div class="col-6 col-sm-7 col-md-5 col-lg-4 col-xl-3">
              <div class="input-group">
                <FloatingNumberField
                  id="total-amount"
                  label="Montant total"
                  disabled
                />
                <span class="input-group-text">€ HT</span>
              </div>
            </div>
            <div class="col-1" />
          </div>
          <button
            class="btn btn-outline-primary text-body"
            @click.prevent="handleAddLine"
          >
            <BiPlusLg class="me-2" />
            Ajouter une ligne
          </button>
        </UiCard>
        <div class="d-flex justify-content-end">
          <button class="btn btn-primary">
            Créer
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
