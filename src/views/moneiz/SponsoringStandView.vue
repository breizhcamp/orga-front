<script setup lang="ts">
import BiCarFrontFill from 'bootstrap-icons/icons/car-front-fill.svg?component';
import BiEnvelope from 'bootstrap-icons/icons/envelope.svg?component';
import BiLink45deg from 'bootstrap-icons/icons/link-45deg.svg?component';
import BiPersonFill from 'bootstrap-icons/icons/person-fill.svg?component';
import { storeToRefs } from 'pinia';
import { capitalize, computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import CardTitle from '@/components/CardTitle.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';
import FloatingTextField from '@/components/FloatingTextField.vue';
import StandMap from '@/components/shared/StandMap.vue';
import UiCard from '@/components/UiCard.vue';
import type { SponsoringId } from '@/dto/moneiz/SponsoringList';
import { getAlreadyAssignedStands, getSponsoring, getSponsoringPlaceInstallationEmailUrl, getSponsoringPlaceRequestEmailUrl, useSetPlaceMutation } from '@/queries/moneiz/sponsorings.queries';
import { getSponsorContacts } from '@/queries/moneiz/sponsors.queries';
import { useEventStore } from '@/stores/event';

const { MONEIZ_URL } = window.env;

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
  isPending: isAlreadyAssignedStandsPending,
  isError: isAlreadyAssignedStandsError,
  error: alreadyAssignedStandsError,
  data: alreadyAssignedStands,
} = getAlreadyAssignedStands(currentEventId);
const {
  isPending: isContactsPending,
  isError: isContactsError,
  error: contactsError,
  data: contacts,
} = getSponsorContacts(computed(() => sponsoring.value?.sponsor?.id));
const {
  isPending: isPlaceRequestEmailUrlPending,
  isError: isPlaceRequestEmailUrlError,
  error: placeRequestEmailUrlError,
  data: placeRequestEmailUrl,
} = getSponsoringPlaceRequestEmailUrl(currentEventId, sponsoringId);
const {
  isPending: isPlaceInstallationEmailUrlPending,
  isError: isPlaceInstallationEmailUrlError,
  error: placeInstallationEmailUrlError,
  data: placeInstallationEmailUrl,
} = getSponsoringPlaceInstallationEmailUrl(currentEventId, sponsoringId);

const setPlaceMutation = useSetPlaceMutation();

const standNumber = ref<string | undefined>();
const disabled = computed(() => {
  return isSponsoringPending.value || setPlaceMutation.isPending.value;
});
const contactCardLoading = computed<boolean>(() => {
  return isContactsPending.value && isPlaceRequestEmailUrlPending.value && isPlaceInstallationEmailUrlPending.value;
});
const filteredContacts = computed(() => {
  return contacts
    .value
    ?.filter(contact => contact.type.includes('PRINCIPAL') || contact.type.includes('COMMUNICATION')) ?? [];
});
const contactsName = computed(() => {
  return filteredContacts.value.map(({ firstname, lastname }) => (firstname ? `${firstname} ${lastname}` : lastname));
});

watch(sponsoring, (sponsoring) => {
  if (sponsoring === undefined) return;
  standNumber.value = sponsoring.standNumber ?? '';
}, { immediate: true });

const handleSubmit = async () => {
  if (currentEventId.value === undefined) return;

  await setPlaceMutation.mutateAsync({
    eventId: currentEventId.value,
    sponsoringId,
    place: standNumber.value,
  });
};
</script>

<template>
  <div class="container-fluid p-4">
    <h1 v-if="isSponsoringPending" class="mb-3 placeholder-glow">
      <span class="placeholder col-4"></span>
    </h1>
    <h1 v-else class="mb-3">
      Stand
      <template v-if="!isSponsoringError && sponsoring?.sponsor">
        {{ sponsoring.sponsor?.name }} - {{ sponsoring.levelName }}
      </template>
    </h1>

    <ErrorAlert v-if="isSponsoringError" :message="sponsoringError?.message" />
    <ErrorAlert
      v-else-if="!isSponsoringPending && !sponsoring?.sponsor"
      message="ce sponsoring n'a pas de sponsor assigné."
    />
    <div v-else class="row mb-3">
      <div class="col-12 col-lg-6">
        <UiCard :loading="isSponsoringPending">
          <CardTitle :loading="isSponsoringPending">Stand</CardTitle>
          <form @submit.prevent="handleSubmit">
            <div class="row">
              <div class="col">
                <FloatingTextField
                  id="stand"
                  label="Stand"
                  :disabled="disabled"
                  v-model="standNumber"
                />
              </div>
              <div class="col-auto d-flex align-items-center">
                <button
                  class="btn btn-primary"
                  type="submit"
                  :disabled="disabled"
                >
                  Enregister
                </button>
              </div>
            </div>
          </form>
        </UiCard>
      </div>

      <div class="col-12 col-lg-6">
        <div class="card" :aria-hidden="contactCardLoading">
          <div class="card-body">
            <CardTitle :loading="contactCardLoading">
              Contacts
            </CardTitle>
            <ErrorAlert
              v-if="isPlaceRequestEmailUrlError"
              :message="placeRequestEmailUrlError?.message"
            />
            <ErrorAlert
              v-if="isPlaceInstallationEmailUrlError"
              :message="placeInstallationEmailUrlError?.message"
            />

            <div class="row g-2">
              <div v-if="!isPlaceRequestEmailUrlError" class="col-auto">
                <button
                  v-if="isPlaceRequestEmailUrlPending"
                  class="btn btn-primary disabled placeholder"
                  style="width: 120px"
                  disabled="true"
                  aria-disabled="true"
                ></button>
                <a
                  v-else
                  :href="placeRequestEmailUrl"
                  class="btn btn-primary"
                >
                  <BiEnvelope class="me-2" />
                  Envoyer
                </a>
              </div>

              <div v-if="sponsoring?.sponsor" class="col-auto">
                <button
                  v-if="isSponsoringPending"
                  class="btn btn-primary disabled placeholder"
                  style="width: 85px"
                  disabled="true"
                  aria-disabled="true"
                ></button>
                <a
                  v-else
                  :href="`${MONEIZ_URL}/sponsors/${sponsoring.sponsor.token}/place`"
                  class="btn btn-primary"
                  target="_blank"
                >
                  <BiLink45deg class="me-2" />
                  Lien
                </a>
              </div>

              <div v-if="!isPlaceInstallationEmailUrlError" class="col-auto">
                <button
                  v-if="isPlaceInstallationEmailUrlPending"
                  class="btn btn-primary disabled placeholder"
                  style="width: 85px"
                  disabled="true"
                  aria-disabled="true"
                ></button>
                <a
                  v-else
                  :href="placeInstallationEmailUrl"
                  class="btn btn-primary"
                  target="_blank"
                >
                  <BiCarFrontFill class="me-2" />
                  Envoyer les informations d'installation
                </a>
              </div>
            </div>
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
              v-for="contact, index in filteredContacts"
              :key="contact.id"
              class="list-group-item"
            >
              <a :href="`mailto:?to=${contactsName[index]} <${contact.email}>`">
                <BiPersonFill class="me-2" />{{ contactsName[index] }} ({{ capitalize(contact.type.join(', ').toLowerCase()) }})
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="!isSponsoringError && !isAlreadyAssignedStandsError" class="d-flex justify-content-center">
      <StandMap
        :level="sponsoring?.levelName.charAt(0) || ''"
        :filledPlaces="alreadyAssignedStands?.filter(stand => stand !== sponsoring?.standNumber) || []"
        v-model="standNumber"
        :disabled="isAlreadyAssignedStandsPending || isSponsoringPending"
        :svgUrl="`${MONEIZ_URL}/img/plan.svg`"
      />
    </div>
    <ErrorAlert
      v-else-if="isAlreadyAssignedStandsError"
      :message="alreadyAssignedStandsError?.message"
    />
  </div>
</template>
