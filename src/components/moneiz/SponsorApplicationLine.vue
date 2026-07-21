<script setup lang="ts">
import { Temporal } from '@js-temporal/polyfill';
import BiChatLeftTextFill from 'bootstrap-icons/icons/chat-left-text-fill.svg?component';
import { computed, ref } from 'vue';

import DropdownButton from '@/components/DropdownButton.vue';
import DropdownDivider from '@/components/DropdownDivider.vue';
import DropdownMenu from '@/components/DropdownMenu.vue';
import ModalInfo from '@/components/modals/ModalInfo.vue';
import ConvertSponsorApplicationModal from '@/components/moneiz/ConvertSponsorApplicationModal.vue';
import DeleteSponsorApplicationModal from '@/components/moneiz/DeleteSponsorApplicationModal.vue';
import type { SponsorApplicationRes } from '@/dto/moneiz/SponsorApplicationRes';

const { sponsorApplication } = defineProps<{
  sponsorApplication: SponsorApplicationRes;
}>();

const contactName = computed(() => {
  const { firstname, lastname } = sponsorApplication.contact;
  return firstname ? `${firstname} ${lastname}` : lastname;
});

const additionalInformationsModal = ref();
const openConvertSponsorApplicationModal = ref(false);
const openDeleteModal = ref(false);
const createdAt = computed(
  () => Temporal.Instant.from(sponsorApplication.createdAt).toLocaleString(),
);
</script>

<template>
  <tr>
    <td class="text-nowrap">{{ createdAt }}</td>
    <td class="text-nowrap">{{ sponsorApplication.companyName }}</td>
    <td>
      <a
        :href="`mailto:${contactName} <${sponsorApplication.contact.email}>`"
        class="text-nowrap"
      >
        {{ contactName }}
      </a>
    </td>
    <td>{{ sponsorApplication.sponsoringLevel ?? '-' }}</td>
    <td>
      <div class="d-flex justify-content-between">
        <div class="text-truncate" style="max-width: 350px;">
          {{ sponsorApplication.additionalInformations }}
        </div>
        <button
          v-if="sponsorApplication.additionalInformations"
          type="button"
          class="btn btn-outline-body"
          @click="additionalInformationsModal.show"
        >
          <BiChatLeftTextFill />
        </button>
      </div>

      <ModalInfo
        name="additional-informations"
        ref="additionalInformationsModal"
      >
        <template #title>
          Informations supplémentaires
        </template>

        {{ sponsorApplication.additionalInformations }}
      </ModalInfo>
    </td>
    <td class="text-end">
      <DropdownMenu>
        <DropdownButton @click="openConvertSponsorApplicationModal = true">
          Créer le sponsoring
        </DropdownButton><DropdownDivider />
        <DropdownButton
          class="text-danger"
          @click="openDeleteModal = true"
        >
          Supprimer
        </DropdownButton>
      </DropdownMenu>

      <ConvertSponsorApplicationModal
        :sponsorApplication="sponsorApplication"
        v-model:open="openConvertSponsorApplicationModal"
      />

      <DeleteSponsorApplicationModal
        :sponsorApplication="sponsorApplication"
        v-model:open="openDeleteModal"
      />
    </td>
  </tr>
</template>
