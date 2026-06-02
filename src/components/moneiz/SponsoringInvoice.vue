<script setup lang="ts">
import BiCurrencyEuro from 'bootstrap-icons/icons/currency-euro.svg?component';
import BiEnvelope from 'bootstrap-icons/icons/envelope.svg?component';
import BiPersonFill from 'bootstrap-icons/icons/person-fill.svg?component';
import { capitalize, computed, ref } from 'vue';

import type { EventId } from '@/dto/kalon/Event';
import { InvoiceState, invoiceStateToString } from '@/dto/moneiz/InvoiceState';
import type { SponsoringRes } from '@/dto/moneiz/SponsoringRes';
import { getSponsorContacts } from '@/queries/moneiz/sponsors.queries';

import CardTitle from '../CardTitle.vue';
import ErrorAlert from '../ErrorAlert.vue';
import FloatingFormField from '../FloatingFormField.vue';
import FloatingSelectField from '../FloatingSelectField.vue';
import UiCard from '../UiCard.vue';
import SponsoringInvoicePdf from './SponsoringInvoicePdf.vue';
import { getSponsoringInvoiceEmailUrl } from '@/queries/moneiz/sponsorings.queries';

const props = defineProps<{
  eventId: EventId;
  sponsoring: SponsoringRes;
}>();

const {
  isPending: isContactsPending,
  isError: isContactsError,
  error: contactsError,
  data: contacts,
} = getSponsorContacts(props.sponsoring.sponsor?.id);

const {
  isPending: isEmailUrlPending,
  isError: isEmailUrlError,
  error: emailUrlError,
  data: emailUrl,
} = getSponsoringInvoiceEmailUrl(props.eventId, props.sponsoring.id);

const contactsName = computed(() => {
  if (contacts.value === undefined) return [];
  return contacts.value.map(({ firstname, lastname }) => (firstname ? `${firstname} ${lastname}` : lastname));
});

const state = ref<InvoiceState>(props.sponsoring.invoiceState || InvoiceState.TODO);
const paiementDate = ref<string | undefined>();
</script>

<template>
  <div class="container-fluid py-4">
    <div class="container mb-4">
      <h1>
        Facture {{ sponsoring.sponsor?.invoiceName }} - {{ sponsoring.levelName }}
      </h1>
      <UiCard class="container mb-3">
        <form @submit.prevent>
          <FloatingSelectField
            id="invoice-state"
            class="mb-3"
            label="Statut"
            v-model="state"
            required
          >
            <option
              v-for="invoiceState in Object.values(InvoiceState)"
              :value="invoiceState"
              :key="invoiceState"
            >
              {{ capitalize(invoiceStateToString[invoiceState]) }}
            </option>
          </FloatingSelectField>
          <FloatingFormField
            id="paiement-date"
            class="mb-3"
            label="Date paiement"
          >
            <input
              type="date"
              id="paiement-date"
              class="form-control"
              placeholder="Date paiement"
              v-model="paiementDate"
            >
          </FloatingFormField>
          <div class="d-flex justify-content-end">
            <button class="btn btn-primary me-2" type="submit">
              Enregistrer
            </button>
            <button class="btn btn-outline-danger text-body">
              Rembourser
            </button>
          </div>
        </form>
      </UiCard>

      <div class="row">
        <div class="col-12 col-md-6">
          <div class="card mb-3" :aria-hidden="isContactsPending && isEmailUrlPending">
            <template v-if="1">
              <div class="card-body">
                <CardTitle :loading="isContactsPending && isEmailUrlPending">
                  Contacts
                </CardTitle>
                <ErrorAlert
                  v-if="isEmailUrlError"
                  class="mb-0"
                  :message="emailUrlError?.message"
                />
                <button
                  v-else-if="isEmailUrlPending"
                  class="btn btn-primary disabled placeholder col-2"
                  disabled="true"
                  aria-disabled="true"
                ></button>
                <a
                  v-else
                  :href="emailUrl"
                  class="btn btn-primary"
                >
                  <BiEnvelope class="me-2" />
                  Send
                </a>
              </div>
              <div v-if="isContactsError" class="card-body">
                <ErrorAlert class="mb-0" :message="contactsError?.message" />
              </div>
              <ul v-else class="list-group list-group-flush">
                <template v-if="isContactsPending">
                  <li class="list-group-item">
                    <p class="card-text placeholder-glow">
                      <span class="placeholder col-5"></span>
                    </p>
                  </li>
                  <li class="list-group-item">
                    <p class="card-text placeholder-glow">
                      <span class="placeholder col-4"></span>
                    </p>
                  </li>
                </template>
                <li
                  v-else
                  v-for="contact, index in contacts"
                  :key="contact.id"
                  class="list-group-item"
                >
                <a :href="`mailto:?to=${contactsName[index]} <${contact.email}>`">
                    <BiPersonFill class="me-2" />{{ contactsName[index] }} (principal)
                  </a>
                </li>
              </ul>
            </template>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <UiCard>
            <CardTitle>GnuCash</CardTitle>
            <button class="btn btn-primary">
              <BiCurrencyEuro class="me-2" />
              Ajouter à GnuCash
            </button>
          </UiCard>
        </div>
      </div>
    </div>

    <SponsoringInvoicePdf
      :eventId="eventId"
      :sponsoringId="sponsoring.id"
    />
  </div>
</template>
