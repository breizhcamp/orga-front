<script setup lang="ts">
import BiEnvelope from 'bootstrap-icons/icons/envelope.svg?component';
import BiPencilSquare from 'bootstrap-icons/icons/pencil-square.svg?component';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import CardText from '@/components/CardText.vue';
import CardTitle from '@/components/CardTitle.vue';
import CopyTextButton from '@/components/CopyTextButton.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';
import AgreementStateBadge from '@/components/moneiz/AgreementStateBadge.vue';
import InvoiceStateBadge from '@/components/moneiz/InvoiceStateBadge.vue';
import SponsorDetailsCard from '@/components/moneiz/SponsorDetailsCard.vue';
import UiCard from '@/components/UiCard.vue';
import type { SponsoringId } from '@/dto/moneiz/SponsoringList';
import {
  getSponsoring,
  getSponsoringAgreementSendEmailUrl,
} from '@/queries/moneiz/sponsorings.queries';
import { useEventStore } from '@/stores/event';

const route = useRoute();
const sponsoringId = route.params.sponsoringId as SponsoringId;

const eventStore = useEventStore();
const { currentEventId } = storeToRefs(eventStore);

const {
  isPending: isSponsoringPending,
  isError: isSponsoringError,
  error: sponsoringError,
  data: sponsoring,
} = getSponsoring(currentEventId, sponsoringId);

const {
  isPending: isAgreemendSendEmailUrlPending,
  isError: isAgreemendSendEmailUrlError,
  error: agreemendSendEmailUrlError,
  data: agreemendSendEmailUrl,
} = getSponsoringAgreementSendEmailUrl(currentEventId, sponsoringId);

const url = computed<string>(() => {
  const token = sponsoring.value?.sponsor?.token;
  if (token === undefined) return '';
  return `${window.env.MONEIZ_URL}/sponsors/${token}/infos`;
});
</script>

<template>
  <div class="container-fluid py-4">
    <ErrorAlert v-if="isSponsoringError" :message="sponsoringError?.message" />
    <div v-else>
      <h1 class="h2 mb-4">
        Sponsoring {{ sponsoring?.levelName }} {{ sponsoring?.sponsor?.name }}
      </h1>
      <div class="row">
        <div
          v-if="isSponsoringPending || sponsoring?.sponsor"
          class="col-12 col-md-8 col-lg-6 col-xl-5 col-xxl-3 mb-4"
        >
          <SponsorDetailsCard
            :sponsor="sponsoring?.sponsor"
            :loading="isSponsoringPending"
          />
        </div>
        <div class="col-12 col-xxl-9">
          <div class="row">
            <div class="col-12 mb-4">
              <UiCard :loading="isSponsoringPending">
                <CardTitle :loading="isSponsoringPending">
                  Convention
                </CardTitle>
                <CardText
                  v-if="isSponsoringPending || sponsoring?.agreementState"
                  :loading="isSponsoringPending"
                  placeholderClass="col-3"
                >
                  <span class="fw-medium me-2">Satut :</span>
                  <AgreementStateBadge
                    v-if="sponsoring?.agreementState"
                    :agreementState="sponsoring.agreementState"
                  />
                </CardText>
                <CardText :loading="isSponsoringPending">
                  <span class="fw-medium me-2">Lien :</span>
                  <a
                    :href="url"
                    class="me-2"
                    target="_blank"
                  >
                    {{ url }}
                  </a>
                  <CopyTextButton title="Copier le lien" :text="url" />
                </CardText>
                <CardText
                  v-if="isSponsoringPending || sponsoring?.presale !== undefined"
                  :loading="isSponsoringPending"
                  placeholderClass="col-4"
                >
                  <span class="fw-medium me-2">
                    Nombre de place en prévente :
                  </span>
                  {{ sponsoring?.presale }}
                </CardText>
                <div class="card-text mb-3">
                  <button
                    v-if="isSponsoringPending || isAgreemendSendEmailUrlPending"
                    class="btn btn-sm btn-primary disabled placeholder col-5"
                    style="width: 32px;"
                    disabled="true"
                    aria-disabled="true"
                  ></button>
                  <ErrorAlert
                    v-else-if="isAgreemendSendEmailUrlError"
                    class="mb-0"
                    :message="agreemendSendEmailUrlError?.message"
                  />
                  <a
                    v-else
                    :href="agreemendSendEmailUrl"
                    class="btn btn-sm btn-primary"
                    title="Envoyer la "
                  >
                    <BiEnvelope />
                  </a>
                </div>
                <div class="card-text">
                  <button
                    v-if="isSponsoringPending"
                    class="btn btn-primary disabled placeholder"
                    style="width: 115px;"
                    disabled="true"
                    aria-disabled="true"
                  ></button>
                  <RouterLink
                    v-else
                    class="btn btn-primary"
                    :to="{
                      name: 'SponsoringAgreement',
                      params: { sponsoringId: sponsoringId },
                    }"
                  >
                    <BiPencilSquare class="me-2" />
                    Modifier
                  </RouterLink>
                </div>
              </UiCard>
            </div>
            <div class="col-12 col-md-6 mb-4">
              <UiCard :loading="isSponsoringPending">
                <CardTitle :loading="isSponsoringPending">
                  Facture
                </CardTitle>
                <CardText
                  :loading="isSponsoringPending"
                  placeholderClass="col-3"
                >
                  <span class="fw-medium me-2">Statut :</span>
                  <InvoiceStateBadge
                    :invoiceState="sponsoring?.invoiceState!"
                  />
                </CardText>
                <button
                  v-if="isSponsoringPending"
                  class="btn btn-primary disabled placeholder"
                  style="width: 115px;"
                  disabled="true"
                  aria-disabled="true"
                ></button>
                <RouterLink
                  v-else
                  class="btn btn-primary"
                  :to="{
                    name: 'SponsoringInvoice',
                    params: { sponsoringId: sponsoringId },
                  }"
                >
                  <BiPencilSquare class="me-2" />
                  Modifier
                </RouterLink>
              </UiCard>
            </div>
            <div class="col-12 col-md-6">
              <UiCard :loading="isSponsoringPending">
                <CardTitle :loading="isSponsoringPending">
                  Stand
                </CardTitle>
                <CardText
                  :loading="isSponsoringPending"
                  placeholderClass="col-3"
                >
                  <template v-if="!sponsoring?.standNumber">
                    Stand: Non défini
                  </template>
                  <template v-else-if="sponsoring.standNumber === 'X'">
                    Stand: En attente de sélection
                  </template>
                  <template v-else>
                    Stand: {{ sponsoring.standNumber }}
                  </template>
                </CardText>
                <button
                  v-if="isSponsoringPending"
                  class="btn btn-primary disabled placeholder"
                  style="width: 115px;"
                  disabled="true"
                  aria-disabled="true"
                ></button>
                <RouterLink
                  v-else
                  class="btn btn-primary"
                  :to="{
                    name: 'SponsoringStand',
                    params: { sponsorId: sponsoringId },
                  }"
                >
                  <BiPencilSquare class="me-2" />
                  Modifier
                </RouterLink>
              </UiCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
