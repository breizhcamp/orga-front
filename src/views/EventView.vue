<template>
  <div>
    <ToolBar title="Events" :actions="actions" />

    <div class="main-content">
      <div class="mb-3 card h-25">
        <div class="card-header d-flex flex-row">
          <h5 class="flex-grow-1 align-self-center">Events</h5>
          <button 
            type="button" 
            @click="addEventModal = true" 
            class="btn btn-primary"
          >
            Add
          </button>
        </div>
      
        <div class="card-body h-50" style="overflow: auto;">
          <div class="container">
            <div class="row row-cols-2">
              <div class="col mb-3" v-for="event in events" :key="event.id">
                <EventCard 
                  :event="event" 
                  :options="eventsOptions.get(event.id) || { members: false, teams: false, slots: false }"
                  :halls="halls"
                  @reload="reloadEvent(event.id)"
                  @reload-members="reloadEvent(event.id, { memberModal: true })" 
                  @reload-teams="reloadEvent(event.id, { teamModal: true })"
                  @reload-slots="reloadEvent(event.id, { slotModal: true })"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row row-cols-2">
        <div class="col">
          <div class="card">
            <div class="card-header d-flex -flex-row">
              <h5 class="flex-grow-1 align-self-center">Members</h5>
              <button type="button" @click="addMemberModal = true" class="btn btn-primary">
                Add
              </button>
            </div>

            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex flex-row align-items-center" v-for="member in members" :key="member.id">
                <EventMemberListItem :member="member" short editable/>
              </li>
            </ul>
          </div>
        </div>

        <div class="col">
          <div class="card">
            <div class="card-header d-flex flex-row">
              <h5 class="flex-grow-1 align-self-center">Halls</h5>
              <button 
                type="button" 
                @click="addHallModal = true"
                class="btn btn-primary"
              >
                Add
              </button>
            </div>

            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex flex-row align-items-center" v-for="hall in halls" :key="hall.id">
                <EventHallListItem 
                  :hall="hall" 
                  :existing-track-ids="halls
                    .map(h => h.trackId)
                    .filter(n => n != undefined && n != hall.trackId)
                    .map(n => n!)"
                  @reload="loadHalls()"
                />
              </li>
              <li class="list-group-item" v-if="halls.length === 0">
                <i>No existing hall</i>
              </li>
            </ul>
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
        <input type="number" id="year" class="form-control" v-model="eventCreationReq.year">
      </div>
      <div>
        <label for="title" class="form-label">Name <b style="color: red;" >*</b></label>
        <input type="text" id="title" class="form-control" v-model="eventCreationReq.name">
      </div>

      <div>
        <label for="debutEvent" class="form-label">Event start</label>
        <input type="date" id="debutEvent" class="form-control" v-model="datesReq.debutEvent">
      </div>
      <div>
        <label for="finEvent" class="form-label">Event end</label>
        <input type="date" id="finEvent" class="form-control" v-model="datesReq.finEvent">
      </div>
      <div>
        <label for="debutCFP" class="form-label">CFP start</label>
        <input type="date" id="debutCFP" class="form-control" v-model="datesReq.debutCFP">
      </div>
      <div>
        <label for="finCFP" class="form-label">CFP end</label>
        <input type="date" id="finCFP" class="form-control" v-model="datesReq.finCFP">
      </div>
      <div>
        <label for="debutInscription" class="form-label">Inscriptions start</label>
        <input type="date" id="debutInscription" class="form-control" v-model="datesReq.debutInscription">
      </div>
      <div>
        <label for="finInscription" class="form-label">Inscriptions end</label>
        <input type="date" id="finInscription" class="form-control" v-model="datesReq.finInscription">
      </div>
    </div>
    <i class="text-muted">Fields with an <b style="color: red;">*</b> must not be empty</i>
  </ModalForm>

  <ModalForm v-model:open="addHallModal" :loading="loading" title="Add new hall" @save="createHall()">
    <div class="alert alert-warning alert-dismissible" role="alert" v-if="addHallAlert">
      <div>A field with <b style="color: red;">*</b> is empty</div>
      <button type="button" class="btn-close" aria-label="Close" @click="addHallAlert = false"></button>
    </div>

    <div class="row gy-3">
      <div>
        <label for="name" class="form-label">Name<b style="color: red;">*</b></label>
        <input type="text" id="name" class="form-control" autocomplete="off" v-model="hallCreationReq.name">
      </div>
      <div>
        <label for="trackId" class="form-label">Track Id</label>
        <input type="number" id="trackId" class="form-control" v-model="hallCreationReq.trackId">
      </div>
    </div>
  </ModalForm>

  <ModalForm v-model:open="addMemberModal" :loading="loading" title="Add new member" @save="createMember()">
    <div class="alert alert-warning alert-dismissible" role="alert" v-if="addMemberAlert">
      <div>A field with <b style="color: red;">*</b> is empty</div>
      <button type="button" class="btn-close" aria-label="Close" @click="addMemberAlert = false"></button>
    </div>

    <div class="row gy-3">
      <div>
        <label for="lastname" class="form-label">Lastname<b style="color: red;">*</b></label>
        <input type="text" id="lastname" class="form-control" autocomplete="off" v-model="memberCreationReq.lastname">
      </div>
      <div>
        <label for="firstname" class="form-label">Firstname<b style="color: red;">*</b></label>
        <input type="text" id="firstname" class="form-control" autocomplete="off" v-model="memberCreationReq.firstname">
      </div>
    </div>
  </ModalForm>

  <ModalInfo v-model:open="exportProgramModal" title="Export program to PDF">
    <div class="row">
      <div class="col-9">
        <label class="form-label" for="event">Event</label>
        <select class="form-select" id="event" @change="e => exportSelectEvent(Number((e.target as HTMLSelectElement).value))">
          <option v-for="event in events" :key="event.id" :selected="event.id === exportSelectedEvent?.id">
            {{ event.name }} - {{ event.year }}
          </option>
        </select>
      </div>
      <div class="col-3 no-label">
        <button class="btn btn-primary" @click="exportPdf()">Export</button>
      </div>
    </div>
  </ModalInfo>
</template>

<script lang="ts">
import ModalForm from "@/components/modals/ModalForm.vue";
import ModalInfo from "@/components/modals/ModalInfo.vue";
import ToolBar from "@/components/ToolBar.vue";
import EventCard, { type EventOptions } from '@/components/EventCard.vue';
import EventHallListItem from '@/components/EventHallListItem.vue'; 
import { EventParticipants, type EventDTO, type EventDates } from "@/dto/EventDTO";
import type { Hall } from "@/dto/Hall";
import type { Member } from "@/dto/Member";
import axios, { type AxiosResponse } from "axios";
import { defineComponent, shallowRef } from "vue";
import EventMemberListItem from "@/components/EventMemberListItem.vue";
import BiFilePdf from 'bootstrap-icons/icons/file-pdf.svg?component'
import type { Action } from "@/dto/Action";
import { downloadPdfWithName } from "@/utils/download";

export interface EventCreationReq {
  name?: string
  year?: number
}

export interface MemberCreationReq {
  lastname?: string
  firstname?: string
}

export interface HallCreationReq {
  name?: string
  trackId?: number
}

export default defineComponent({
  name: "EventView",
  components: { ToolBar, ModalForm, ModalInfo, EventCard, EventMemberListItem, EventHallListItem },

  data() {
    return {
      eventCount: { total: 0, current: 0 },
      events: [] as EventDTO[],
      eventsOptions: new Map<number, EventOptions>(),
      members: [] as Member[],
      halls: [] as Hall[],
      addEventModal: false,
      addMemberModal: false,
      addHallModal: false,
      loading: false,
      eventCreationReq: {} as EventCreationReq,
      memberCreationReq: {} as MemberCreationReq,
      hallCreationReq: {} as HallCreationReq,
      datesReq: {} as EventDates,
      addEventAlert: false,
      addMemberAlert: false, 
      addHallAlert: false,
      actions: [] as Array<Action>,
      exportProgramModal: false,
      exportProgramModalAlert: false,
      exportSelectedEvent: undefined as EventDTO | undefined
    }
  },

  mounted() {
    this.loadOnMounted();

    this.actions = [
      { 
        label: "Exporter en PDF", 
        title: "Export", 
        function: () => this.exportProgramModal = true, 
        // @ts-ignore : We pass a shallowRef instead of the component
        icon: shallowRef(BiFilePdf)
      }
    ]
  },

  methods: {
    loadOnMounted() {
      this.loadEvents();
      this.loadMembers();
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

    loadEvent(id: number, options?: { 
      memberModal?: boolean, 
      teamModal?: boolean, 
      slotModal?: boolean 
    }) {
      axios.get('/kalon/events/' + id).then((response: AxiosResponse<EventDTO>) => {
        let event = { ...response.data };
        event.participants = new EventParticipants(event.participants as Array<any>);

        if (event.debutEvent) {
          event.debutEvent = new Date(event.debutEvent);
        }
        if (event.finEvent) {
          event.finEvent = new Date(event.finEvent);
        }
        if (event.debutCFP) {
          event.debutCFP = new Date(event.debutCFP);
        }
        if (event.finCFP) {
          event.finCFP = new Date(event.finCFP);
        }
        if (event.debutInscription) {
          event.debutInscription = new Date(event.debutInscription);
        }
        if (event.finInscription) {
          event.finInscription = new Date(event.finInscription);
        }

        this.events.push(event);
        if (options) {
          let fullOptions: EventOptions = { members: false, teams: false, slots: false };
          fullOptions.members = options.memberModal || false;
          fullOptions.teams = options.teamModal || false;
          fullOptions.slots = options.slotModal || false;
          this.eventsOptions.set(id, fullOptions);
        }

        this.eventCount.current++;
        if (this.eventCount.total === this.eventCount.current) {
          this.events.sort((a, b) => b.year - a.year);
          this.exportSelectedEvent = this.events[0];
        }
      })
    },

    reloadEvent(id: number, options?: { 
      memberModal?: boolean, 
      teamModal?: boolean,
      slotModal?: boolean
    }) {
      this.events = this.events.filter((e) => e.id != id);
      this.eventCount.current--;
      this.loadEvent(id, options);
    },

    loadMembers() {
      axios.get('/kalon/members').then((response: AxiosResponse<string[]>) => {
        const ids = response.data;
        const total = ids.length;
        let current = 0;
        this.members = [];
        ids.forEach(id => {
          axios.get('/kalon/members/' + id).then((response: AxiosResponse<Member>) => {
            this.members.push(response.data);
            current++;
            if (current == total) {
              this.members.sort((a, b) => (a.lastname + a.firstname)
                .localeCompare(b.lastname + b.firstname));
            }
          })
        })
      })
    },

    loadHalls() {
      this.halls = [];
      axios.get('/konter/halls').then((response: AxiosResponse<Hall[]>) => {
        this.halls = response.data;
      })
    },

    createEvent() {
      if (
        this.eventCreationReq.name == undefined ||
        this.eventCreationReq.year == undefined
      ) {
        this.addEventAlert = true;
        return;
      }
      
      axios.post('/kalon/events', this.eventCreationReq)
      .then((response: AxiosResponse<EventDTO>) => {
        if (
          this.datesReq.debutEvent == undefined &&
          this.datesReq.finEvent == undefined &&
          this.datesReq.debutCFP == undefined &&
          this.datesReq.finCFP == undefined &&
          this.datesReq.debutInscription == undefined &&
          this.datesReq.finInscription == undefined
        ) {
          this.addEventAlert = false;
          this.addEventModal = false;
          this.eventCreationReq = {};
          this.loadEvents();
        } else {
          axios.post('/kalon/events/' + response.data.id, this.datesReq).then(
            () => {
              this.addEventAlert = false;
              this.addEventModal = false;
              this.eventCreationReq = {};
              this.loadEvents();
            }
          )
        }
      })
    },

    createMember() {
      if (
        this.memberCreationReq.lastname == undefined ||
        this.memberCreationReq.firstname == undefined
      ) {
        this.addMemberAlert = true;
        return;
      }

      axios.post("/kalon/members", this.memberCreationReq)
        .then(() => {
          this.addMemberAlert = false;
          this.addMemberModal = false;
          this.memberCreationReq = {};
          this.loadMembers();
        })
    },

    createHall() {
      if (
        this.hallCreationReq.name == undefined
      ) {
        this.addHallAlert = true;
        return;
      }

      axios.post(`/konter/halls`, this.hallCreationReq)
        .then(() => {
          this.addHallAlert = false;
          this.addHallModal = false;
          this.hallCreationReq = {};
          this.loadHalls();
        })
    },

    exportSelectEvent(eventId: number) {
      this.exportSelectedEvent = this.events.find(e => e.id === eventId)
    },

    exportPdf() {
      if (this.exportSelectedEvent == undefined) {
        this.exportProgramModalAlert = true;
        return;
      }

      this.exportProgramModalAlert = false;
      axios.get("/konter/slots/program/" + this.exportSelectedEvent.id, { responseType: "blob" })
      .then((response) => {
        downloadPdfWithName(response, `program_${this.exportSelectedEvent?.name}.pdf`);
        this.exportProgramModal = false;
      })
    }
  }
})
</script>