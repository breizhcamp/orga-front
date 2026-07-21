<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import ErrorAlert from '@/components/ErrorAlert.vue';
import FloatingSelectField from '@/components/FloatingSelectField.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ModalForm from '@/components/modals/ModalForm.vue';
import type { SponsorApplicationRes } from '@/dto/moneiz/SponsorApplicationRes';
import { listLevels } from '@/queries/moneiz/levels.queries';
import {
  useConvertSponsorApplicationMutation,
} from '@/queries/moneiz/sponsor-applications.queries';
import { useSponsors } from '@/queries/moneiz/sponsors.queries';
import { useEventStore } from '@/stores/event';

const NEW_SPONSOR_VALUE = 'NEW_SPONSOR';

const eventStore = useEventStore();
const { currentEventId } = storeToRefs(eventStore);

const router = useRouter();

const { sponsorApplication } = defineProps<{
  sponsorApplication: SponsorApplicationRes;
}>();

const open = defineModel<boolean>('open', { required: true });

const {
  isPending: isSponsorsPending,
  isError: isSponsorsError,
  error: sponsorsError,
  data: sponsors,
} = useSponsors();

const {
  isPending: isLevelsPending,
  isError: isLevelsError,
  error: levelsError,
  data: levels,
} = listLevels();

const convertSponsorApplicationMutation = useConvertSponsorApplicationMutation();

const selectedSponsor = ref<string>('');
const sponsoringLevel = ref<string>(sponsorApplication.sponsoringLevel ?? '');

const loading = computed(() => {
  return isSponsorsPending.value || isLevelsPending.value;
});
const error = computed(() => {
  return isSponsorsError.value
    || isLevelsError.value
    || convertSponsorApplicationMutation.isError.value
  ;
});

const handleSave = async () => {
  if (currentEventId.value === undefined) return;
  if (!selectedSponsor.value) return;
  if (!sponsoringLevel.value) return;

  const { id } = await convertSponsorApplicationMutation.mutateAsync({
    eventId: currentEventId.value,
    sponsorApplicationId: sponsorApplication.id,
    convertSponsorApplicationReq: {
      sponsoringLevel: sponsoringLevel.value,
      sponsor: selectedSponsor.value === NEW_SPONSOR_VALUE
        ? undefined
        : selectedSponsor.value,
    },
  });

  await router.push({
    name: 'SponsoringDetails',
    params: { sponsoringId: id },
  });
};
</script>

<template>
  <ModalForm
    v-model:open="open"
    title="Convertir en sponsoring"
    saveButtonText="Convertir"
    :loading="convertSponsorApplicationMutation.isPending.value"
    @save="handleSave"
  >
    <LoadingSpinner v-if="loading" />
    <template v-else>
      <ErrorAlert
        v-if="isSponsorsError"
        :message="sponsorsError?.message"
      />
      <ErrorAlert
        v-if="isLevelsError"
        :message="levelsError?.message"
      />
      <ErrorAlert
        v-if="convertSponsorApplicationMutation.isError.value"
        :message="convertSponsorApplicationMutation?.error.value?.message"
      />
      <template v-if="!error">
        <FloatingSelectField
          id="sponsors"
          class="mb-3"
          label="Sponsor"
          :disabled="convertSponsorApplicationMutation.isPending.value"
          v-model="selectedSponsor"
        >
          <option disabled value="">Sélectionner un sponsor</option>
          <hr />
          <option :value="NEW_SPONSOR_VALUE">
            Créer un nouveau sponsor
          </option>
          <hr />
          <option
            v-for="sponsor in sponsors"
            :value="sponsor.id"
            :key="sponsor.id"
          >
            {{ sponsor.name }}
          </option>
        </FloatingSelectField>

        <FloatingSelectField
          id="sponsoring-level"
          label="Niveau"
          :disabled="convertSponsorApplicationMutation.isPending.value"
          v-model="sponsoringLevel"
        >
          <option disabled value="">Sélectionner un niveau</option>
          <hr />
          <option
            v-for="level in levels"
            :value="level.name"
            :key="level.name"
          >
            {{ level.name }}
          </option>
        </FloatingSelectField>
      </template>
    </template>
  </ModalForm>
</template>
