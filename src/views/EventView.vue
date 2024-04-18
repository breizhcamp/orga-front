<template>
  <ToolBar title="Événements" :actions="[]" />

  <div class="mb-3 main-content">
    <div class="card">
      <div class="card-header d-flex flex-row">
        <h5 class="flex-grow-1 align-self-center">Tous les événements</h5>
        <button 
          type="button" 
          @click="addEventModal = true" 
          class="btn btn-primary"
        >
          Ajouter
        </button>
      </div>
      <div class="card-body">
        <div class="container">
          <div class="row row-cols-2">
            <div class="col mb-3">
              <EventCard 
                v-for="event in events" 
                :key="event.id" 
                :event="event" 
                :options="eventsOptions.get(event.id) || { member: false, team: false}"
                @reload="reloadEvent(event.id)"
                @reload-members="reloadEvent(event.id, { memberModal: true })" 
                @reload-teams="reloadEvent(event.id, { teamModal: true })"
              />
            </div>      
          </div>
        </div>
      </div>
    </div>
  </div>

  <ModalForm v-model:open="addEventModal" :loading="loading" title="Ajouter un nouvel événement">
  </ModalForm>
</template>

<script lang="ts">
import ModalForm from "@/components/ModalForm.vue";
import ToolBar from "@/components/ToolBar.vue";
import EventCard from '@/components/EventCard.vue';
import { EventParticipants, type EventDTO } from "@/dto/EventDTO";
import type { Hall } from "@/dto/Hall";
import axios, { type AxiosResponse } from "axios";
import { defineComponent } from "vue";

export default defineComponent({
  name: "EventView",
  components: { ToolBar, ModalForm, EventCard },

  data() {
    return {
      eventCount: { total: 0, current: 0 },
      events: [] as EventDTO[],
      eventsOptions: new Map<number, { member: boolean, team: boolean}>(),
      halls: [] as Hall[],
      addEventModal: false,
      loading: false,
    }
  },

  mounted() {
    this.loadOnMounted();
  },

  methods: {
    loadOnMounted() {
      this.loadEvents();
      this.loadHalls();
    },

    loadEvents() {
      axios.get('/kalon/events').then((response: AxiosResponse<number[]>) => {
        this.events = [];
        this.eventCount.current = 0;
        this.eventCount.total = response.data.length;
        response.data.forEach((value: number) => {
          this.loadEvent(value);
        })
      })
    },

    loadEvent(id: number, options?: { memberModal?: boolean, teamModal?: boolean }) {
      axios.get('/kalon/events/' + id).then((response: AxiosResponse<EventDTO>) => {
        let event = { ...response.data };
        event.participants = new EventParticipants(event.participants as Array<any>);

        if (event.debutEvent) {
          event.debutEvent = new Date(event.debutEvent)
        }
        if (event.finEvent) {
          event.finEvent = new Date(event.finEvent)
        }
        if (event.debutCFP) {
          event.debutCFP = new Date(event.debutCFP)
        }
        if (event.finCFP) {
          event.finCFP = new Date(event.finCFP)
        }
        if (event.debutInscription) {
          event.debutInscription = new Date(event.debutInscription)
        }
        if (event.finInscription) {
          event.finInscription = new Date(event.finInscription)
        }
        this.events.push(event);
        if (options) {
          let fullOptions = { member: false, team: false }
          fullOptions.member = options.memberModal || false
          fullOptions.team = options.teamModal || false
          this.eventsOptions.set(id, fullOptions)
        }

        this.eventCount.current++;
        if (this.eventCount.total === this.eventCount.current) {
          this.events.sort((a, b) => b.year - a.year);
        }
      })
    },

    reloadEvent(id: number, options?: { memberModal?: boolean, teamModal?: boolean }) {
      this.events = this.events.filter((e) => e.id != id)
      this.eventCount.current--;
      this.loadEvent(id, options);
    },

    loadHalls() {
      axios.get('/konter/halls').then((response: AxiosResponse<Hall[]>) => {
        this.halls = response.data
      })
    }
  }
})
</script>