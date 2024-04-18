<template>
  <ToolBar title="Events" :actions="[]" />

  <div class="mb-3 main-content">
    <div class="card">
      <div class="card-header d-flex flex-row">
        <h5 class="flex-grow-1 align-self-center">All events</h5>
        <button 
          type="button" 
          @click="addEventModal = true" 
          class="btn btn-primary"
        >
          Add
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

  <ModalForm v-model:open="addEventModal" :loading="loading" title="Add new event" @save="createEvent()" >
    <div class="alert alert-warning alert-dismissible" role="alert" v-if="addEventAlert">
      <div>A field with <b style="color: red;">*</b> is empty</div>
      <button type="button" class="btn-close" aria-label="Close" @click="addEventAlert = false"></button>
    </div>
    <div class="row row-cols-2 gy-3">
      <div>
        <label for="year" class="form-label">Year <b style="color: red;" >*</b></label>
        <input type="number" id="year" class="form-control" v-model="creationReq.year">
      </div>
      <div>
        <label for="title" class="form-label">Name <b style="color: red;" >*</b></label>
        <input type="text" id="title" class="form-control" v-model="creationReq.name">
      </div>

      <div>
        <label for="debutEvent" class="form-label">Event beginning</label>
        <input type="date" id="debutEvent" class="form-control" v-model="datesReq.debutEvent">
      </div>
      <div>
        <label for="finEvent" class="form-label">Event end</label>
        <input type="date" id="finEvent" class="form-control" v-model="datesReq.finEvent">
      </div>
      <div>
        <label for="debutCFP" class="form-label">CFP beginning</label>
        <input type="date" id="debutCFP" class="form-control" v-model="datesReq.debutCFP">
      </div>
      <div>
        <label for="finCFP" class="form-label">CFP end</label>
        <input type="date" id="finCFP" class="form-control" v-model="datesReq.finCFP">
      </div>
      <div>
        <label for="debutInscription" class="form-label">Inscriptions beginning</label>
        <input type="date" id="debutInscription" class="form-control" v-model="datesReq.debutInscription">
      </div>
      <div>
        <label for="finInscription" class="form-label">Inscriptions end</label>
        <input type="date" id="finInscription" class="form-control" v-model="datesReq.finInscription">
      </div>
    </div>
    <i class="text-muted">Fields with an <b style="color: red;">*</b> must not be empty</i>
  </ModalForm>
</template>

<script lang="ts">
import ModalForm from "@/components/ModalForm.vue";
import ToolBar from "@/components/ToolBar.vue";
import EventCard from '@/components/EventCard.vue';
import { EventParticipants, type EventDTO, type EventDates } from "@/dto/EventDTO";
import type { Hall } from "@/dto/Hall";
import axios, { type AxiosResponse } from "axios";
import { defineComponent } from "vue";

export interface EventCreationReq {
  name?: string
  year?: number
}

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
      creationReq: {} as EventCreationReq,
      datesReq: {} as EventDates,
      addEventAlert: false,
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
    },

    createEvent() {
      if (
        this.creationReq.name == undefined ||
        this.creationReq.year == undefined
      ) {
        this.addEventAlert = true;
        return;
      }
      
      axios.post('/kalon/events', this.creationReq)
      .then((response: AxiosResponse<EventDTO>) => {
        if (
          this.datesReq.debutEvent == undefined ||
          this.datesReq.finEvent == undefined ||
          this.datesReq.debutCFP == undefined ||
          this.datesReq.finCFP == undefined ||
          this.datesReq.debutInscription == undefined ||
          this.datesReq.finInscription == undefined
        ) {
          this.addEventAlert = false;
          this.addEventModal = false;
          this.loadEvents();
        } else {
          axios.post('/kalon/events/' + response.data.id, this.datesReq).then(
            () => {
              this.addEventAlert = false;
              this.addEventModal = false;
              this.loadEvents();
            }
          )
        }
      })
    }
  }
})
</script>