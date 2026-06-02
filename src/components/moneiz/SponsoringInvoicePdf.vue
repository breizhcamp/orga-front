<script setup lang="ts">
import type { EventId } from '@/dto/kalon/Event';
import type { SponsoringId } from '@/dto/moneiz/SponsoringList';

defineProps<{
  eventId: EventId;
  sponsoringId: SponsoringId;
}>();

const { MONEIZ_URL } = window.env;
</script>

<template>
  <iframe
    :src="`${MONEIZ_URL}/api/admin/${eventId}/sponsorings/${sponsoringId}/invoice/file`"
    class="w-100"
    height="800"
    frameborder="0"
  ></iframe>
</template>
