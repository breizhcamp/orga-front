<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ErrorAlert from '@/components/ErrorAlert.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import InvoiceForm from '@/components/moneiz/InvoiceForm.vue';
import SponsoringInvoice from '@/components/moneiz/SponsoringInvoice.vue';
import type { SponsoringId } from '@/dto/moneiz/SponsoringList';
import { getSponsoring } from '@/queries/moneiz/sponsorings.queries';
import { useEventStore } from '@/stores/event';

const router = useRouter();
const route = useRoute();
const sponsoringId = route.params.sponsoringId as SponsoringId;

const eventStore = useEventStore();
const { currentEventId } = storeToRefs(eventStore);

watch(currentEventId, async (eventId) => {
  if (eventId === undefined) {
    await router.replace({ name: 'ListEvent' });
  }
}, { immediate: true });

const {
  isPending,
  isError,
  isSuccess,
  error,
  data: sponsoring,
} = getSponsoring(currentEventId, sponsoringId);
</script>

<template>
  <div v-if="!isSuccess" class="container py-4">
    <LoadingSpinner v-if="isPending" />
    <ErrorAlert v-else-if="isError" :message="error?.message" />
  </div>
  <template v-else>
    <InvoiceForm v-if="!sponsoring?.invoiceState" />
    <SponsoringInvoice
      :eventId="currentEventId!"
      :sponsoring="sponsoring!"
    />
  </template>
</template>
