<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import CardText from '@/components/CardText.vue';
import CardTitle from '@/components/CardTitle.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';
import FloatingTextField from '@/components/FloatingTextField.vue';
import StandMap from '@/components/shared/StandMap.vue';
import UiCard from '@/components/UiCard.vue';
import type { SponsoringId } from '@/dto/moneiz/SponsoringList';
import { getSponsoring, useSetPlaceMutation } from '@/queries/moneiz/sponsorings.queries';
import { useEventStore } from '@/stores/event';

const route = useRoute();
const sponsoringId = route.params.sponsoringId as SponsoringId;

const eventStore = useEventStore();
const { currentEventId } = storeToRefs(eventStore);

const assignedStand: string[] = [];

const {
  isPending: isSponsoringPending,
  isError: isSponsoringError,
  error: sponsoringError,
  data: sponsoring,
} = getSponsoring(currentEventId, sponsoringId);
const setPlaceMutation = useSetPlaceMutation();

const standNumber = ref<string | undefined>();
const disabled = computed(() => {
  return isSponsoringPending.value || setPlaceMutation.isPending.value;
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
    <UiCard v-else class="mb-3" :loading="isSponsoringPending">
      <CardTitle :loading="isSponsoringPending">Stand</CardTitle>
      <CardText :loading="isSponsoringPending">
        <template v-if="assignedStand.length">
          Stand déjà alloués :
          {{ assignedStand.join(', ') }}
        </template>
        <template v-else>
          Aucun stand n'est alloué pour le moment.
        </template>
      </CardText>
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

    <div class="d-flex justify-content-center">
      <StandMap
        :level="'P'"
        :filledPlaces="['P2']"
        v-model="standNumber"
      />
    </div>
  </div>
</template>
