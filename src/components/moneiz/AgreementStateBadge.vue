<script lang="ts" setup>
import LabelBadge from '@/components/LabelBadge.vue';
import {
  type AgreementState,
  agreementStateColors,
  agreementStateToString,
} from '@/dto/moneiz/AgreementState';

defineProps<{
  agreementState: AgreementState;
}>();
</script>

<template>
  <LabelBadge
    :color="agreementStateColors[agreementState]"
    :label="agreementStateToString[agreementState]"
  />
</template>
