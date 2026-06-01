<script setup lang="ts">
import axios from 'axios';
import BiPlus from 'bootstrap-icons/icons/plus-lg.svg?component';
import { computed, ref } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import type { LevelList } from '@/dto/moneiz/LevelList.ts';
import type { SponsoringList } from '@/dto/moneiz/SponsoringList.ts';
import type { SponsorList } from '@/dto/moneiz/SponsorList';
import { TicketsState } from '@/dto/moneiz/TicketsState';
import { useSetSponsorMutation } from '@/queries/moneiz/sponsorings.queries';
import { useEventStore } from '@/stores/event';

import DropdownButton from '../DropdownButton.vue';
import DropdownDivider from '../DropdownDivider.vue';
import DropdownMenu from '../DropdownMenu.vue';
import DropdownRouterLink from '../DropdownRouterLink.vue';
import LabelBadge from '../LabelBadge.vue';
import SponsoringState from './SponsoringState.vue';

const props = defineProps<{
  sponsoring: SponsoringList;
  level: LevelList | undefined;
  availableSponsors: SponsorList[];
}>();

const emit = defineEmits<{
  error: [errorMessage: string | null];
}>();

const eventStore = useEventStore();

const sponsor = ref<string>('');
const setSponsorMutation = useSetSponsorMutation();

type Badge = ComponentProps<typeof LabelBadge>;

const ticketsStateBadges = {
  [TicketsState.TODO]: {
    label: 'à faire',
    color: 'secondary',
  },
  [TicketsState.GENERATED]: {
    label: 'généré',
    color: 'warning',
  },
  [TicketsState.SENT]: {
    label: 'envoyé',
    color: 'success',
  },
} as const satisfies Record<TicketsState, Badge>;

const ticketsStateBadge = computed(() => {
  const ticketsState = props.sponsoring.ticketsState || TicketsState.TODO;
  return ticketsStateBadges[ticketsState];
});

const setErrorMessage = (message: string | null) => {
  emit('error', message);
};

const handleSponsorSelected = async () => {
  if (sponsor.value === '') return;

  setErrorMessage(null);
  const { id: sponsoringId } = props.sponsoring;
  const { currentEventId } = eventStore;
  try {
    await setSponsorMutation.mutateAsync({
      eventId: currentEventId!,
      sponsoringId,
      sponsorId: sponsor.value,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      let message = error.message;
      if (error.response?.data.message) {
        message += `: ${error.response.data.message as string}`;
      }
      setErrorMessage(message);
    } else if (error instanceof Error) {
      setErrorMessage(error.message);
    } else {
      throw error;
    }
  }
};

const handleDelete = () => {
  console.log('delete');
};
</script>

<template>
  <tr>
    <th scope="row">
      <div
        class="level-badge d-flex align-items-center justify-content-center text-dark rounded-circle fw-bold"
        :style="{ backgroundColor: level?.color || '#cccccc' }"
      >
        {{ sponsoring.levelName.charAt(0).toUpperCase() }}
      </div>
    </th>

    <td class="sponsor-name">
      <RouterLink
        v-if="sponsoring.sponsor"
        :to="{ name: 'SponsorEdit', params: { sponsorId: sponsoring.sponsor.id } }"
        class="fw-medium link-underline link-underline-opacity-0 link-underline-opacity-100-hover"
        :title="`Modifier ${sponsoring.sponsor.name}`"
      >
        {{ sponsoring.sponsor.name }}
      </RouterLink>

      <form v-else @submit.prevent="handleSponsorSelected" class="d-flex gap-2">
        <select
          id="sponsor"
          class="form-select form-select-sm"
          v-model="sponsor"
          :disabled="setSponsorMutation.isPending.value"
          aria-label="Sélectioner un sponsor"
          required
        >
          <option selected disabled value="">Sélectioner un sponsor</option>
          <option
            v-for="sponsor in availableSponsors"
            :value="sponsor.id"
            :key="sponsor.id"
          >
            {{ sponsor.name }}
          </option>
        </select>
        <button
          class="btn btn-sm btn-primary"
          type="submit"
          title="Sélectioner"
          :disabled="setSponsorMutation.isPending.value"
        >
          <BiPlus />
        </button>
      </form>
    </td>

    <td>
      <SponsoringState :sponsoring="sponsoring" />
    </td>

    <td>
      {{ sponsoring.standNumber || '-' }}
    </td>

    <td>
        <LabelBadge v-if="sponsoring.sponsor" v-bind="ticketsStateBadge" />
    </td>

    <td class="text-end">
      <DropdownMenu>
        <DropdownRouterLink
          v-if="sponsoring.sponsor"
          :to="{
            name: 'SponsoringAgreement',
            params: { sponsoringId: sponsoring.id },
          }"
        >
          Convention
        </DropdownRouterLink>
        <DropdownRouterLink :to="{
          name: 'SponsoringInvoice',
          params: { sponsoringId: sponsoring.id },
        }">
          Facture
        </DropdownRouterLink>
        <DropdownRouterLink :to="{
          name: 'SponsoringDetails',
          params: { sponsoringId: sponsoring.id },
        }">
          Détails
        </DropdownRouterLink>
        <DropdownDivider />
        <DropdownButton
          class="text-danger"
          @click="handleDelete"
        >
          Supprimer
        </DropdownButton>
      </DropdownMenu>
    </td>
  </tr>
</template>

<style scoped>
.level-badge {
  width: 32px;
  height: 32px;
}

.sponsor-name {
  min-width: 250px;
}
</style>
