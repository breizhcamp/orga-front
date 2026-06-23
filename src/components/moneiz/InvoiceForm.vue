<script setup lang="ts">
import { Temporal } from '@js-temporal/polyfill';
import BiPlusLg from 'bootstrap-icons/icons/plus-lg.svg?component';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import ErrorAlert from '@/components/ErrorAlert.vue';
import FloatingDateField from '@/components/FloatingDateField.vue';
import FloatingFormField from '@/components/FloatingFormField.vue';
import FloatingSelectField from '@/components/FloatingSelectField.vue';
import FloatingTextareaField from '@/components/FloatingTextareaField.vue';
import FloatingTextField from '@/components/FloatingTextField.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import UiCard from '@/components/UiCard.vue';
import type { InvoiceTemplateLineRes } from '@/dto/moneiz/InvoiceTemplateRes';
import { InvoiceType } from '@/dto/moneiz/InvoiceType';
import type { SponsoringId } from '@/dto/moneiz/SponsoringList';
import { getSponsoringInvoiceTemplate, useGenerateSponsoringInvoiceMutation } from '@/queries/moneiz/sponsorings.queries';
import { useEventStore } from '@/stores/event';

const route = useRoute();
const sponsoringId = route.params.sponsoringId as SponsoringId;

const eventStore = useEventStore();
const { currentEventId } = storeToRefs(eventStore);

const {
  isPending,
  isError,
  error,
  data: invoiceTemplate,
} = getSponsoringInvoiceTemplate(currentEventId, sponsoringId);

const generateSponsoringInvoiceMutation = useGenerateSponsoringInvoiceMutation();

const reference = ref<string>('');
const creationDate = ref<string>(Temporal.Now.plainDateISO().toString());
const buyerName = ref<string>('');
const buyerAddress = ref<string>('');
const service = ref<string>('');
const location = ref<string>('');
const purchaseOrderReference = ref<string>('');
const buyerVatId = ref<string>('');
const buyerSiret = ref<string>('');
const type = ref<InvoiceType>(InvoiceType.INVOICE);
const lines = ref<InvoiceTemplateLineRes[]>([]);

const totalAmount = computed(() => {
  return lines.value.reduce((total, line) => total + line.amount, 0);
});

watch(invoiceTemplate, (invoiceTemplate) => {
  if (invoiceTemplate === undefined) return;
  reference.value = invoiceTemplate.reference;
  location.value = invoiceTemplate.location;
  buyerName.value = invoiceTemplate.invoiceName ?? '';
  buyerAddress.value = invoiceTemplate.address ?? '';
  buyerVatId.value = invoiceTemplate.vatId ?? '';
  buyerSiret.value = invoiceTemplate.siret ?? '';
  lines.value = [...invoiceTemplate.lines];
  lines.value = invoiceTemplate.lines.map((line) => {
    return { ...line };
  });
}, { immediate: true });

const addLine = () => {
  lines.value = [...lines.value, {
    description: '',
    amount: 0,
  }];
};

const removeLine = (index: number) => {
  lines.value = lines.value.filter((_line, i) => i !== index);
};

const handleSubmit = async () => {
  if (!currentEventId.value) return;
  if (!reference.value.trim()) return;
  if (!creationDate.value.trim()) return;
  if (!buyerName.value.trim()) return;
  if (!buyerAddress.value.trim()) return;
  if (!location.value.trim()) return;
  if (!buyerSiret.value.trim()) return;
  if (!lines.value.length) return;
  for (const line of lines.value) {
    if (!line.description.trim()) return;
  }

  await generateSponsoringInvoiceMutation.mutateAsync({
    eventId: currentEventId.value,
    sponsoringId,
    invoiceReq: {
      reference: reference.value.trim(),
      creationDate: creationDate.value.trim(),
      buyer: {
        name: buyerName.value.trim(),
        address: buyerAddress.value.trim(),
        vatId: buyerVatId.value.trim() || undefined,
        siret: buyerSiret.value.trim(),
      },
      location: location.value.trim(),
      purchaseOrderReference: purchaseOrderReference.value.trim() || undefined,
      service: service.value.trim() || undefined,
      lines: lines.value.map(({ description, amount }) => {
        return {
          description: description.trim(),
          amount,
        };
      }),
      type: type.value,
    },
  });
};
</script>

<template>
  <div class="container py-4">
    <LoadingSpinner v-if="isPending" />
    <ErrorAlert v-else-if="isError" :message="error?.message" />
    <template v-else>
      <h1 class="mb-4">
        Facture {{ invoiceTemplate?.invoiceName }}
      </h1>
      <ErrorAlert
        v-if="generateSponsoringInvoiceMutation.isError.value"
        :message="generateSponsoringInvoiceMutation.error.value?.message"
      />
      <form @submit.prevent="handleSubmit">
        <UiCard class="mb-3">
          <div class="row">
            <div class="col-12 col-lg-6 mb-3 mb-lg-0">
              <div class="row mb-3">
                <div class="col-6">
                  <FloatingTextField
                    id="reference"
                    label="Reférence"
                    v-model="reference"
                    :disabled="generateSponsoringInvoiceMutation.isPending.value"
                    required
                  />
                </div>
                <div class="col-6">
                  <FloatingDateField
                    id="creation-date"
                    label="Date de création"
                    v-model="creationDate"
                    :disabled="generateSponsoringInvoiceMutation.isPending.value"
                    required
                  />
                </div>
              </div>
              <FloatingTextField
                id="buyer-name"
                label="Raison sociale"
                class="mb-3"
                v-model="buyerName"
                :disabled="generateSponsoringInvoiceMutation.isPending.value"
                required
              />
              <FloatingTextareaField
                id="buyer-address"
                label="Adresse"
                class="mb-3"
                style="height: 132px;"
                v-model="buyerAddress"
                :disabled="generateSponsoringInvoiceMutation.isPending.value"
                required
              />
              <FloatingTextField
                id="service"
                label="Service"
                v-model="service"
                :disabled="generateSponsoringInvoiceMutation.isPending.value"
              />
            </div>
            <div class="col-12 col-lg-6">
              <FloatingTextField
                id="location"
                label="Localité"
                class="mb-3"
                v-model="location"
                :disabled="generateSponsoringInvoiceMutation.isPending.value"
                required
              />
              <FloatingTextField
                id="purchase-order-reference"
                label="N° de bon de commande"
                class="mb-3"
                v-model="purchaseOrderReference"
                :disabled="generateSponsoringInvoiceMutation.isPending.value"
              />
              <FloatingTextField
                id="buyer-vat-id"
                label="Numéro de TVA"
                class="mb-3"
                v-model="buyerVatId"
                :disabled="generateSponsoringInvoiceMutation.isPending.value"
              />
              <FloatingTextField
                id="buyer-siret"
                label="SIRET"
                class="mb-3"
                v-model="buyerSiret"
                :disabled="generateSponsoringInvoiceMutation.isPending.value"
                required
              />
              <FloatingSelectField
                id="type"
                label="Type"
                v-model="type"
                :disabled="generateSponsoringInvoiceMutation.isPending.value"
                required
              >
                <option :value="InvoiceType.QUOTE">Devis</option>
                <option :value="InvoiceType.INVOICE">Facture</option>
              </FloatingSelectField>
            </div>
          </div>
        </UiCard>
        <UiCard class="mb-3">
          <div
            v-for="(line, index) in lines"
            :key="index"
            class="row mb-3"
          >
            <div class="col">
              <FloatingTextField
                :id="`description-${index}`"
                label="Description"
                v-model="line.description"
                :disabled="generateSponsoringInvoiceMutation.isPending.value"
                required
              />
            </div>
            <div class="col-6 col-sm-7 col-md-5 col-lg-4 col-xl-3">
              <div class="input-group">
                <FloatingFormField
                  :id="`amount-${index}`"
                  label="Montant"
                  :required="true"
                >
                <input
                  type="number"
                  :id="`amount-${index}`"
                  class="form-control"
                  :step="0.01"
                  placeholder="Montant"
                  v-model="line.amount"
                  :disabled="generateSponsoringInvoiceMutation.isPending.value"
                  required
                />
                </FloatingFormField>
                <span class="input-group-text">€ HT</span>
              </div>
            </div>
            <div class="col-1 d-flex align-items-center justify-content-end">
              <button
                type="button"
                class="btn-close"
                title="Supprimer la ligne"
                @click.prevent="removeLine(index)"
                :disabled="generateSponsoringInvoiceMutation.isPending.value"
              />
            </div>
          </div>
        <div class="row mb-3">
          <div class="col" />
            <div class="col-6 col-sm-7 col-md-5 col-lg-4 col-xl-3">
              <div class="input-group">
                <FloatingFormField
                  id="total-amount"
                  label="Montant total"
                >
                <input
                  type="number"
                  id="total-amount"
                  class="form-control"
                  placeholder="Montant total"
                  :step="0.01"
                  v-model="totalAmount"
                  disabled
                />
                </FloatingFormField>
                <span class="input-group-text">€ HT</span>
              </div>
            </div>
            <div class="col-1" />
            </div>
            <button
              type="button"
              class="btn btn-outline-primary text-body"
              @click.prevent="addLine"
              :disabled="generateSponsoringInvoiceMutation.isPending.value"
            >
              <BiPlusLg class="me-2" />
              Ajouter une ligne
            </button>
        </UiCard>
        <div class="d-flex justify-content-end">
          <button
            class="btn btn-primary"
            :disabled="generateSponsoringInvoiceMutation.isPending.value"
          >
            Créer
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
