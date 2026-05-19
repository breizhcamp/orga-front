<script setup lang="ts">
import BiPlus from 'bootstrap-icons/icons/plus.svg?component';
import { computed, ref, watch } from 'vue';

import type { ContactReq } from '@/dto/moneiz/ContactReq';
import type { ContactRes } from '@/dto/moneiz/ContactRes';
import { getSponsorContacts, useUpdateSponsorContactsMutation } from '@/queries/moneiz/sponsors.queries';

import SponsorContactLineForm from './SponsorContactLineForm.vue';

const props = defineProps<{
  sponsorId: string;
}>();

export type ContactWithKey = ContactReq & { key: string };

const contacts = ref<ContactWithKey[]>([]);
const dataInitialized = ref(false);
const disabled = ref(false);

const contactsQuery = getSponsorContacts(props.sponsorId, true);

const loading = computed<boolean>(() => contactsQuery.isPending.value);

const normalizeContacts = (contacts: ContactRes[]): ContactWithKey[] => {
  return contacts.toSorted((a, b) => a.id - b.id).map((contact) => {
    return {
      ...contact,
      key: crypto.randomUUID(),
    };
  });
};

watch(contactsQuery.data, (newData) => {
  if (newData && !dataInitialized.value) {
    contacts.value = normalizeContacts(newData);
    dataInitialized.value = true;
  }
}, { immediate: true });

const updateSponsorContactsMutation = useUpdateSponsorContactsMutation();

const handleSubmit = async () => {
  disabled.value = true;
  try {
    const result = await updateSponsorContactsMutation.mutateAsync({
      sponsorId: props.sponsorId,
      contacts: contacts.value.map(({ id, firstname, lastname, email, type }) => {
        return {
          id,
          firstname: firstname?.trim(),
          lastname: lastname.trim(),
          email: email.trim(),
          type,
        };
      }),
    });
    contacts.value = normalizeContacts(result);
  } finally {
    disabled.value = false;
  }
};

const handleContactDelete = (contactKey: string) => {
  contacts.value = contacts.value.filter(({ key }) => key !== contactKey);
};

const handleAddContact = () => {
  contacts.value = [...contacts.value, {
    firstname: '',
    lastname: '',
    email: '',
    type: [],
    key: crypto.randomUUID(),
  }];
};

const handleCancel = () => {
  if (contactsQuery.data.value === undefined) return;

  contacts.value = normalizeContacts(contactsQuery.data.value);
};
</script>

<template>
  <div class="card h-100">
    <div class="card-body">
      <h5 class="card-title mb-3">Contacts</h5>
      <div v-if="loading" class="d-flex justify-content-center">
        <div class="spinner-border">
          <span class="visually-hidden">Chargement des contacts...</span>
        </div>
      </div>
      <form v-else @submit.prevent="handleSubmit">
        <SponsorContactLineForm
          v-for="contact, index in contacts"
          v-model="contacts[index]!"
          :disabled="disabled"
          :key="contact.key"
          @delete="handleContactDelete"
        />

        <div class="mb-2">
          <button
            class="btn btn-outline-primary text-body "
            :disabled="disabled"
            @click.prevent="handleAddContact"
          >
            <BiPlus />
            Ajouter un contact
          </button>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button
            class="btn btn-secondary"
            :disabled="disabled"
            @click.prevent="handleCancel"
          >
            Annuler
          </button>
          <button
            class="btn btn-primary"
            type="submit"
            :disabled="disabled"
          >
            Enregister les contacts
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
