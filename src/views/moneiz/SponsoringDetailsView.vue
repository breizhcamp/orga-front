<script setup lang="ts">
import BiCheckLg from 'bootstrap-icons/icons/check-lg.svg?component';
import BiCopy from 'bootstrap-icons/icons/copy.svg?component';
import BiEnvelope from 'bootstrap-icons/icons/envelope.svg?component';
import BiPlusLg from 'bootstrap-icons/icons/plus-lg.svg?component';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import CardText from '@/components/CardText.vue';
import CardTitle from '@/components/CardTitle.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';
import LabelBadge from '@/components/LabelBadge.vue';
import SponsorDetailsCard from '@/components/moneiz/SponsorDetailsCard.vue';
import UiCard from '@/components/UiCard.vue';
import { agreementStateColors, agreementStateToString } from '@/dto/moneiz/AgreementState';
import type { SponsoringId } from '@/dto/moneiz/SponsoringList';
import { getSponsoring } from '@/queries/moneiz/sponsorings.queries';
import { useEventStore } from '@/stores/event';

const LINK_COPY_TIMEOUT_TIME_MS = 1000;

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

const linkCopiedTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const url = computed<string | null>(() => {
  const token = sponsoring.value?.sponsor?.token;
  if (token === undefined) return null;
  return `${window.env.MONEIZ_URL}/sponsors/${token}/infos`;
});

const handleCopyLink = async () => {
  if (url.value === null) return;
  await navigator.clipboard.writeText(url.value);
  if (linkCopiedTimeout.value) {
    clearTimeout(linkCopiedTimeout.value);
  }
  linkCopiedTimeout.value = setTimeout(() => {
    linkCopiedTimeout.value = null;
  }, LINK_COPY_TIMEOUT_TIME_MS);
};
</script>

<template>
  <div class="container-fluid py-4">
    <ErrorAlert v-if="isError" :message="error?.message" />
    <div v-else>
      <h1 class="h2 mb-4">
        Sponsoring {{ sponsoring?.levelName }} {{ sponsoring?.sponsor?.name }}
      </h1>
      <div class="row">
        <div
          v-if="isPending || sponsoring?.sponsor"
          class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-3 mb-4"
        >
          <SponsorDetailsCard
            :sponsor="sponsoring?.sponsor"
            :loading="isPending"
          />
        </div>
        <div class="col-12 col-lg-11 col-xl-9 col-xxl-7 mb-4">
          <UiCard :loading="isPending">
            <CardTitle :loading="isPending">
              Convention
            </CardTitle>
            <CardText
              v-if="isPending || sponsoring?.agreementState"
              :loading="isPending"
              placeholderClass="col-3"
            >
              <span class="fw-medium me-2">Satut :</span>
              <LabelBadge
                v-if="sponsoring?.agreementState"
                :color="agreementStateColors[sponsoring?.agreementState]"
                :label="agreementStateToString[sponsoring?.agreementState]"
              />
            </CardText>
            <p v-if="isPending" class="card-text placeholder-glow">
              <span class="placeholder col-6"></span>
            </p>
            <p v-else-if="url !== null" class="card-text">
              <span class="fw-medium me-2">Lien :</span>
              <a
                :href="url"
                class="me-2"
                target="_blank"
              >
                {{ url }}
              </a>
              <button
                class="btn btn-sm btn-outline-secondary"
                title="Copier le lien"
                @click="handleCopyLink"
              >
                <BiCopy v-if="!linkCopiedTimeout" />
                <BiCheckLg v-else class="text-success-emphasis" />
              </button>
            </p>
            <p v-if="isPending" class="card-text placeholder-glow">
              <span class="placeholder col-4"></span>
            </p>
            <p
              v-else-if="sponsoring?.presale !== undefined"
              class="card-text"
            >
              <span class="fw-medium me-2">
                Nombre de place en prévente :
              </span>
              {{ sponsoring?.presale }}
            </p>
            <div class="card-text mb-3">
              <button class="btn btn-sm btn-primary">
                <BiEnvelope />
              </button>
            </div>
            <div class="card-text mb-3">
              <button class="btn btn-primary">
                Renvoyer la convention
              </button>
            </div>
            <div class="card-text">
              <button class="btn btn-primary">
                <BiPlusLg class="me-2" />
                Créer la convention en ligne
              </button>
            </div>
          </UiCard>
        </div>
        <div class="col-12 mb-4">
          <UiCard :loading="isPending">
            <CardTitle :loading="isPending">
              Facture
            </CardTitle>
            <p class="card-text">
              <span class="fw-medium me-2">
                Statut :
              </span>
              <LabelBadge
                color="primary"
                label="TODO"
              />
            </p>
          </UiCard>
        </div>
        <div class="col-12 mb-4">
          <UiCard :loading="isPending">
            <CardTitle :loading="isPending">
              Stand
            </CardTitle>
          </UiCard>
        </div>
      </div>
    </div>
  </div>
</template>
