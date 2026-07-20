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

const updateSponsorContactsMutation = useUpdateSponsorContactsMutation();

const contacts = ref<ContactWithKey[]>([]);
const dataInitialized = ref(false);
const disabled = computed(() => updateSponsorContactsMutation.isPending.value);

const contactsQuery = getSponsorContacts(props.sponsorId, true);

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
const lines = ref<(InstanceType<typeof SponsorContactLineForm> | null)[]>([]);
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

const handleSubmit = async () => {
  if (lines.value.some(line => line !== null && !line.validate())) return;
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
          :ref="line => lines[index] = line as InstanceType<typeof SponsorContactLineForm>"
          :disabled="disabled"
          :key="contact.key"
          @delete="handleContactDelete"
        />

        <div class="mb-2">
          <button
            class="btn btn-outline-primary text-body"
            type="button"
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
            type="button"
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
            Enregistrer les contacts
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
