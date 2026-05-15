<script setup lang="ts">
import { computed } from 'vue';

import { newSponsor, type Sponsor } from '@/dto/moneiz/Sponsor';

const props = defineProps<{
  modelValue: Sponsor | undefined;
  disabled: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Sponsor];
}>();

const localSponsor = computed({
  get: () => props.modelValue ?? newSponsor(),
  set: (value) => { emit('update:modelValue', value); },
});
</script>

<template>
  <div class="card h-100">
    <div class="card-body">
      <h5 class="card-title mb-3">Informations de facturation</h5>
      <form @submit.prevent>
        <div class="row mb-3">
          <label for="invoice-name" class="col-sm-3 col-form-label">
            Raison sociale
          </label>
          <div class="col-sm-9">
            <input
              id="invoice-name"
              type="text"
              class="form-control"
              v-model="localSponsor.invoiceName"
              :disabled="disabled"
            />
          </div>
        </div>

        <div class="row mb-3">
          <label for="address" class="col-sm-3 col-form-label">
            Adresse
          </label>
          <div class="col-sm-9">
            <textarea
              id="address"
              class="form-control"
              rows="4"
              v-model="localSponsor.address"
              :disabled="disabled"
            />
          </div>
        </div>

        <div class="row mb-3">
          <label for="vat-id" class="col-sm-3 col-form-label">
            Numéro de TVA
          </label>
          <div class="col-sm-9">
            <input
              id="vat-id"
              type="text"
              class="form-control"
              v-model="localSponsor.vatId"
              :disabled="disabled"
            />
          </div>
        </div>

        <div class="row mb-3">
          <label for="siret" class="col-sm-3 col-form-label">
            Siret
          </label>
          <div class="col-sm-9">
            <input
              id="siret"
              type="text"
              class="form-control"
              v-model="localSponsor.siret"
              :disabled="disabled"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
