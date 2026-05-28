<script setup lang="ts">
import { computed } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { AgreementState, agreementStateColors, agreementStateToString } from '@/dto/moneiz/AgreementState';
import { InvoiceState } from '@/dto/moneiz/InvoiceState';
import { type SponsoringList } from '@/dto/moneiz/SponsoringList';

import LabelBadge from '../LabelBadge.vue';

const props = defineProps<{
  sponsoring: SponsoringList;
}>();

type Badge = ComponentProps<typeof LabelBadge>;

const agreementStateBadges = Object.fromEntries(
  Object.values(AgreementState)
    .map(state => [state, {
      label: 'convention : ' + agreementStateToString[state],
      color: agreementStateColors[state],
    }]),
) as Record<AgreementState, Badge>;

const invoiceStateBadges = {
  [InvoiceState.TODO]: {
    label: 'facture: à faire',
    color: 'secondary',
  },
  [InvoiceState.ORDER_FORM]: {
    label: 'facture: att. bon comm.',
    color: 'purple',
  },
  [InvoiceState.TO_SEND]: {
    label: 'facture: à envoyer',
    color: 'warning',
  },
  [InvoiceState.SENT]: {
    label: 'facture: envoyée',
    color: 'info',
  },
  [InvoiceState.REMINDED]: {
    label: 'facture: relancée',
    color: 'orange',
  },
  [InvoiceState.PAYED]: {
    label: 'facture: payée',
    color: 'success',
  },
  [InvoiceState.REFUNDED]: {
    label: 'facture: remboursée',
    color: 'danger',
  },
} as const satisfies Record<InvoiceState, Badge>;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
const badge = computed<Badge | null>(() => {
  const { agreementState, invoiceState } = props.sponsoring;
  if (invoiceState === undefined) {
    if (agreementState === undefined) {
      return null;
    }
    return agreementStateBadges[agreementState];
  }
  if (agreementState !== AgreementState.SIGNED) {
    return {
      label: 'État invalide',
      color: 'danger',
    };
  }
  return invoiceStateBadges[invoiceState];
});
</script>

<template>
  <LabelBadge v-if="badge" v-bind="badge" />
</template>
