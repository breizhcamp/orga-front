<script lang="ts" setup>
import LabelBadge from '@/components/LabelBadge.vue';
import {
  type InvoiceState,
  invoiceStateColors,
  invoiceStateToString,
} from '@/dto/moneiz/InvoiceState';

defineProps<{
  invoiceState: InvoiceState;
}>();
</script>

<template>
  <LabelBadge
    :color="invoiceStateColors[invoiceState]"
    :label="invoiceStateToString[invoiceState]"
  />
</template>
