<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

import ErrorAlert from '@/components/ErrorAlert.vue';
import ModalForm from '@/components/modals/ModalForm.vue';
import WarningAlert from '@/components/WarningAlert.vue';
import type { SponsorApplicationRes } from '@/dto/moneiz/SponsorApplicationRes';
import {
  useDeleteSponsorApplicationMutation,
} from '@/queries/moneiz/sponsor-applications.queries';
import { useEventStore } from '@/stores/event';

const eventStore = useEventStore();
const { currentEventId } = storeToRefs(eventStore);

const { sponsorApplication } = defineProps<{
  sponsorApplication: SponsorApplicationRes;
}>();

const open = defineModel<boolean>('open', { required: true });

const deleteSponsorApplicationMutation = useDeleteSponsorApplicationMutation();

const handleDelete = async () => {
  if (currentEventId.value === undefined) return;

  await deleteSponsorApplicationMutation.mutateAsync({
    eventId: currentEventId.value,
    sponsorApplicationId: sponsorApplication.id,
  });
  open.value = false;
};

watch(open, (open) => {
  if (!open) {
    deleteSponsorApplicationMutation.reset();
  }
});
</script>

<template>
 <ModalForm
    v-model:open="open"
    :loading="deleteSponsorApplicationMutation.isPending.value"
    title="Supprimer la demande de sponsor"
    saveButtonText="Supprimer"
    saveButtonVariant="danger"
    @save="handleDelete"
  >
    <ErrorAlert
      v-if="deleteSponsorApplicationMutation.isError.value"
      :message="deleteSponsorApplicationMutation.error.value?.message"
    />
    <WarningAlert>Cette action est irréversible.</WarningAlert>
    <p class="text-start mb-3">
      Vous êtes sur le point de supprimer la demande de sponsor
      <strong>{{ sponsorApplication.companyName }}</strong>.
    </p>
  </ModalForm>
</template>
