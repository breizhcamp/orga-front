<script setup lang="ts">
import BiTrash from 'bootstrap-icons/icons/trash.svg?component';

import type { ContactReq } from '@/dto/moneiz/ContactReq';
import { CONTACT_TYPES, type ContactType } from '@/dto/moneiz/ContactType';

import type { ContactWithKey } from './SponsorContactForm.vue';

const props = defineProps<{
  modelValue: ContactWithKey;
  disabled: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ContactReq];
  'delete': [contactKey: string];
}>();

const handleFirstnameChange = (event: InputEvent) => {
  const firstname = (event.target as HTMLInputElement).value;
  emit('update:modelValue', {
    ...props.modelValue,
    firstname,
  });
};

const handleLastnameChange = (event: InputEvent) => {
  const lastname = (event.target as HTMLInputElement).value;
  emit('update:modelValue', {
    ...props.modelValue,
    lastname,
  });
};

const handleEmailChange = (event: InputEvent) => {
  const email = (event.target as HTMLInputElement).value;
  emit('update:modelValue', {
    ...props.modelValue,
    email,
  });
};

const handleCheckboxChange = (event: InputEvent, contactType: ContactType) => {
  const { checked } = event.target as HTMLInputElement;
  if (checked) {
    emit('update:modelValue', {
      ...props.modelValue,
      type: [contactType, ...props.modelValue.type],
    });
  } else {
    emit('update:modelValue', {
      ...props.modelValue,
      type: props.modelValue.type.filter(value => value !== contactType),
    });
  }
};

const handleDeleteButtonClick = () => {
  emit('delete', props.modelValue.key);
};
</script>

<template>
  <div class="row mb-2">
    <div class="col-sm-2">
      <label :for="`firstname-${modelValue.key}`">Prénom</label>
      <input
        type="text"
        class="form-control"
        :id="`firstname-${modelValue.key}`"
        :value="modelValue.firstname"
        :disabled="disabled"
        @input="handleFirstnameChange"
      />
    </div>

    <div class="col-sm-2">
      <label :for="`lastname-${modelValue.key}`">Nom</label>
      <input
        type="text"
        class="form-control"
        :id="`lastname-${modelValue.key}`"
        :value="modelValue.lastname"
        :disabled="disabled"
        @input="handleLastnameChange"
      />
    </div>

    <div class="col-sm-3">
      <label :for="`email-${modelValue.key}`">E-mail</label>
      <input
        type="email"
        class="form-control"
        :id="`email-${modelValue.key}`"
        :value="modelValue.email"
        :disabled="disabled"
        @input="handleEmailChange"
      />
    </div>

    <div class="col-sm">
      <label>Type de contact</label>
      <div>
        <div
          class="form-check form-check-inline"
          v-for="contactType, index in CONTACT_TYPES"
          :key="index"
        >
          <input
            type="checkbox"
            class="form-check-input"
            :id="`type-${contactType.toLowerCase()}-${modelValue.key}`"
            :checked="modelValue.type.indexOf(contactType) != -1"
            :disabled="disabled"
            @change="handleCheckboxChange($event as InputEvent, contactType)"
          />
          <label
            :for="`type-${contactType.toLowerCase()}-${modelValue.key}`"
            class="form-check-label"
          >
            {{ contactType }}
          </label>
        </div>
      </div>
    </div>

    <div class="col-auto align-self-center">
      <button
        class="btn btn-outline-secondary"
        :disabled="disabled"
        title="Supprimer"
        @click.prevent="handleDeleteButtonClick"
      >
        <BiTrash />
      </button>
    </div>
  </div>
</template>

<style lang="css" scoped>
.form-check-label {
  user-select: none;
}
</style>
