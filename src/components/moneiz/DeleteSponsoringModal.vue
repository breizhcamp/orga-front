<script setup lang="ts">
import axios from 'axios';
import { computed, ref } from 'vue';

import type { EventId } from '@/dto/kalon/Event';
import type { SponsoringId } from '@/dto/moneiz/SponsoringList';
import { useDeleteSponsoringMutation } from '@/queries/moneiz/sponsorings.queries';

import ErrorAlert from '../ErrorAlert.vue';
import ModalForm from '../modals/ModalForm.vue';
import WarningAlert from '../WarningAlert.vue';

const props = defineProps<{
  eventId: EventId;
  sponsoring: {
    id: SponsoringId;
    levelName: string;
    sponsor?: { name: string };
  };
}>();

const open = defineModel<boolean>('open', { required: true });

const deleteSponsoringMutation = useDeleteSponsoringMutation();

const errorMessage = ref<string | null | undefined>(null);
const loading = computed(() => deleteSponsoringMutation.isPending.value);

const handleDelete = async () => {
  errorMessage.value = null;

  try {
    await deleteSponsoringMutation.mutateAsync({
      eventId: props.eventId,
      sponsoringId: props.sponsoring.id,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.message;
    } else if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = undefined;
    }
    return;
  }

  open.value = false;
};
</script>

<template>
 <ModalForm
    v-model:open="open"
    :loading="loading"
    title="Supprimer le sponsoring"
    saveButtonText="Supprimer"
    saveButtonVariant="danger"
    @save="handleDelete"
  >
    <ErrorAlert v-if="errorMessage !== null" :message="errorMessage" />
    <WarningAlert v-if="sponsoring.sponsor">Cette action est irréversible.</WarningAlert>
    <p v-if="sponsoring.sponsor" class="text-start mb-3">
      Vous êtes sur le point de supprimer le sponsoring {{ sponsoring.levelName }}
      <strong>{{ sponsoring.sponsor.name }}</strong>.
    </p>
    <p v-else class="text-start mb-3">
      Vous êtes sur le point de supprimer un slot de sponsoring
      <strong>{{ sponsoring.levelName }}</strong>.
    </p>
  </ModalForm>
</template>
