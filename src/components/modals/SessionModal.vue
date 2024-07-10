<template>
  <ModalInfo v-model:open="modalOpen" :title="session.title" size="lg">
    <h2 class="fs-4">Badges</h2>
    <SessionBadges :session="session" />
    <hr>
    <h2 class="fs-4">Speakers</h2>
    <div class="d-flex mb-3">
      <div 
        v-for="speaker in session.speakers" 
        :key="speaker.id" 
        class="rounded-pill badge me-1 d-flex align-items-center"
        :class="session.owner.id == speaker.id ? 'text-bg-success' : 'text-bg-secondary'"
      >
        <ProfilePicture :src="speaker.profilePicture" :name="speaker.firstname + ' ' + speaker.lastname" />
        <span class="visually-hidden">
          {{ speaker.firstname }} {{ speaker.lastname }}
        </span>
        <span class="mx-1" aria-hidden="true">
          {{ speaker.firstname[0] + '. ' + speaker.lastname }}
        </span>
      </div>
    </div>

    <div id="description">
      <hr>
      <h2 class="fs-4">Description</h2>
      <p style="white-space: pre-wrap;" class="text-break">{{ session.description }}</p>
    </div>

    <div id="owner-notes" v-if="session.ownerNotes.trim().length > 0">
      <hr>
      <h2 class="fs-4">Owner Notes</h2>
      <p style="white-space: pre-wrap;" class="text-break">{{ session.ownerNotes }}</p>
    </div>
  </ModalInfo>
</template>

<script lang="ts">
import type { Session } from '@/dto/Session';
import { defineComponent, type PropType } from 'vue';
import ModalInfo from "@/components/modals/ModalInfo.vue";
import SessionBadges from '@/components/SessionBadges.vue';
import ProfilePicture from '@/components/ProfilePicture.vue';


export default defineComponent({
  name: "SessionModal",
  props: {
    open: { type: Boolean, required: true },
    session: { type: Object as PropType<Session>, required: true }
  },

  components: { ModalInfo, SessionBadges, ProfilePicture },

  data() {
    return {
      modalOpen: this.open
    }
  },

  emits: ['close'],

  watch: {
    open() {
      this.modalOpen = this.open
    },

    modalOpen() {
      if (!this.modalOpen) {
        this.$emit('close')
      }
    }
  },
})
</script>