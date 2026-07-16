<script setup lang="ts">
import { computed } from 'vue';

import type { SponsorApplicationRes } from '@/dto/moneiz/SponsorApplicationRes';

const { sponsorApplication } = defineProps<{
  sponsorApplication: SponsorApplicationRes;
}>();

const contactName = computed(() => {
  const { firstname, lastname } = sponsorApplication.contact;
  return firstname ? `${firstname} ${lastname}` : lastname;
});
</script>

<template>
  <tr>
    <td class="text-nowrap">{{ sponsorApplication.companyName }}</td>
    <td>
      <a
        :href="`mailto:${contactName} <${sponsorApplication.contact.email}>`"
        class="text-nowrap"
      >
        {{ contactName }}
      </a>
    </td>
    <td>{{ sponsorApplication.sponsoringLevel }}</td>
  </tr>
</template>
