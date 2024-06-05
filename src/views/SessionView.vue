<template>
  <ToolBar title="Sessions" :actions="actions"/>

  <div class="mb-3 main-content">
    <div class="dropdown">
      <button 
        type="button" 
        class="btn btn-primary dropdown-toggle" 
        :class="openYearDropdown ? 'show' : null" 
        @click="openYearDropdown = !openYearDropdown"
      >{{ currentEvent?.name }}</button>
      <ul class="dropdown-menu" :class="openYearDropdown ? 'show' : null">
        <li
          v-for="event in events" 
          :key="event.id"
        >
          <button 
            type="button" 
            class="dropdown-item" 

            :class="event.id === currentEvent?.id ? 'active' : null" 
            @click="currentEvent = event"
          >
            {{ event.name }}
          </button>
        </li>
      </ul>

      <SessionFilter v-model:filter="filter" @filter="(f) => loadSessions(f)" :loseFocus="forceModalOpen" />
    </div>

    <SessionCard 
      v-for="session in sessions" 
      :key="session.id" 
      :session="session" 
      :availableHalls="halls" 
      :slots="currentEvent?.slots"
      :forceModal="forceModalOpen"
      :event-start="currentEvent?.debutEvent ? new Date(currentEvent.debutEvent) : new Date(Date.now())"
      @reload="reloadSessions()"
    />
  </div>

  <ModalForm v-model:open="importModal" :loading="loading" title="Import" @save="importCsv()">
    <!-- Description -->
    <div class="mb-3">
      <h5>Import here the files obtained via Sessionize</h5>
      To get the three CSV files : 
      <ol>
        <li>Go to the event dashboard > Export</li>
        <li>Download the <code>Everything in a single file</code> option</li>
        <li>Save the 
          <code>Sessions</code>, 
          <code>Speakers</code> & 
          <code>Evaluation results</code>
          worksheets as CSV <b>with <code>UTF-8</code> format</b></li>
      </ol>
    </div>

    <!-- CSV File for speakers -->
    <div class="mb-3">
      <b>Speakers CSV file</b><br/>
      Format (with header) : Speaker Id, FirstName, LastName, Email, 
      TagLine, Bio, Profile Picture 
    </div>
    <div class="mb-3">
      <input 
        type="file" 
        class="form-control" 
        id="speakers-file" 
        accept="text/csv" 
        @change="onSpeakersFileSelected($event)"
      >
    </div>

    <!-- CSV File for sessions -->
    <div class="mb-3">
      <b>Sessions CSV file</b><br/>
      Format (with header) : Session Id, Title, Description, Owner, 
      Owner Email, Speakers, Format, Thème, Niveau, Status, Date Submitted, 
      Owner Notes, Speaker Ids
    </div>
    <div class="mb-3">
      <input 
        type="file" 
        class="form-control" 
        id="sessions-file" 
        accept="text/csv" 
        @change="onSessionsFileSelected($event)"
      >
    </div>

    <!-- CSV File for sessions evaluations -->
    <div class="mb-3">
      <b>Evaluations CSV File</b><br/>
      Format (with header) : Session Id, Title, Description, Owner, 
      Owner Email, Speakers, Format, Thème, Niveau, Evaluation
    </div>
    <div class="mb-3">
      <input 
        type="file" 
        id="evaluations-file" 
        class="form-control" 
        accept="text/csv" 
        @change="onEvaluationsFileSelected($event)"
      >
    </div>
  </ModalForm>

  <button 
    type="button" 
    class="btn btn-light border border-dark border-2 m-1 rounded-pill position-fixed bottom-0 end-0" 
    @click="backToTop"
  >
    <p class="d-inline mx-1 fs-6">Back to top</p>
    <BiArrowUpCircleFill viewBox="0 0 16 16" height="32" width="32"/>
  </button>

</template>

<script lang="ts">
/// <reference types="vite-svg-loader" />

import ModalForm from '@/components/ModalForm.vue';
import ToolBar from '@/components/ToolBar.vue';
import SessionCard from '@/components/SessionCard.vue';
import SessionFilter from '@/components/SessionFilter.vue'
import type { SessionFilter as Filter } from '@/dto/SessionFilter';
import type { Session } from '@/dto/Session';
import { sessionDTOToSession } from '@/dto/Session';
import type { Action } from '@/dto/Action';
import type { EventDTO } from '@/dto/EventDTO';
import axios, { type AxiosResponse } from 'axios';
import BiFilePdf from 'bootstrap-icons/icons/file-pdf.svg?component'
import BiDatabaseUp from 'bootstrap-icons/icons/database-up.svg?component'
import BiArrowUpCircleFill from 'bootstrap-icons/icons/arrow-up-circle-fill.svg?component'
import { defineComponent, shallowRef } from 'vue';
import type { Hall } from '@/dto/Hall';
import type { Slot } from '@/dto/Slot';
import { downloadPdfWithName } from '@/utils/download';

export default defineComponent({
  name: "SessionView",
  components: { 
    ModalForm, 
    ToolBar, 
    SessionFilter, 
    SessionCard, 
    BiArrowUpCircleFill 
  },

  data() {
    return {
      currentEvent: undefined as EventDTO | undefined,
      events: [] as EventDTO[],
      halls: [] as Hall[],
      sessions: [] as Session[],
      loading: false,
      importModal: false,
      exportModal: false,
      openYearDropdown: false,
      speakersFile: null as File | null,
      sessionsFile: null as File | null,
      evaluationsFile: null as File | null,
      actions: [] as Action[],
      filter: {} as Object,
      filterById: false,
      eventCount: { total: 0, current: 0 },
      forceModalOpen: false,
    }
  },

  mounted() {
    this.actions = [
      { 
        label: "Importer", 
        title: "Import", 
        function: () => { this.importModal = true }, 
        // @ts-ignore : We pass a shallowRef instead of the component
        icon: shallowRef(BiDatabaseUp) 
      },       
      { 
        label: "Exporter", 
        title: "Export", 
        function: () => { this.exportPDFCards() }, 
        // @ts-ignore : We pass a shallowRef instead of the component
        icon: shallowRef(BiFilePdf) 
      },       
    ]

    this.loadOnMounted();
  },

  watch: {
    currentEvent() {
      this.loadSessions();
      this.loadHalls();
      this.loadSlots();
    }
  },

  methods: {
    loadOnMounted() {
      this.loadEvents();
    },
    
    loadEvents() {
      axios.get('/kalon/events')
      .then((response: AxiosResponse<number[]>) => {
        this.events = [];
        const ids = response.data;
        this.eventCount.total = ids.length;
        this.eventCount.current = 0;

        for (let i = 0; i < ids.length; i++) {
          this.loadEvent(ids[i]);
        }
      })
    },
    
    loadEvent(eventId: number) {
      axios.get(`/kalon/events/${eventId}`)
      .then((response: AxiosResponse<EventDTO>) => {
        this.events.push(response.data);
        this.eventCount.current++;

        if (this.eventCount.total == this.eventCount.current) {
          this.events.sort((a, b) => b.year - a.year);
          this.currentEvent = this.events[0];
          
          this.loadSessions();
          this.loadHalls();
        }
      })
    },

    loadSessions(filter?: Filter) {
      if (this.currentEvent == null) return;
      if (filter == null) {
        axios.get(`/konter/sessions/${this.currentEvent.id}`)
        .then((response) => {
          this.sessions = response.data.map(sessionDTOToSession);
        });
      } else {
        this.filterById = filter.id != undefined;
        this.filter = filter;
        axios.post(
          `/konter/sessions/${this.currentEvent.id}/filter`, 
          filter
        ).then((response: AxiosResponse<any[]>) => {
          this.sessions = response.data.map(sessionDTOToSession);
          this.forceModalOpen = response.data.length === 1 && this.filterById;
        });
      }
    },

    reloadSessions() {
      this.loadSessions(this.filter);
    },

    loadHalls() {
      const url = '/konter/halls' 
        + (this.currentEvent != null ? '/' + this.currentEvent?.id : '');
      axios.get(url).then((response: AxiosResponse<Array<Hall>>) => {
        this.halls = response.data;
      })
    },

    loadSlots() {
      if (this.currentEvent == null) return; 

      axios.get('/konter/slots/event/' + this.currentEvent.id).then(
        (response: AxiosResponse<Map<number, Map<number, Array<Slot>>>>) => {
          this.currentEvent!.slots = new Map(Object.entries(response.data).map(
            row => [ Number(row[0]) , new Map(Object.entries(row[1]).map(
              column => [ this.halls.find(h => h.id == Number(column[0]))!!, column[1] as Slot[]]
            ))]
          ));
        }
      )
    },

    importCsv() {
      if(!this.speakersFile) return

      this.loading = true

      const speakerFormData = new FormData()
      speakerFormData.append('file', this.speakersFile)

      axios.post(`/konter/speakers/import`, speakerFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {

        if(!this.sessionsFile) return;

        const sessionsFormData = new FormData();
        sessionsFormData.append('file', this.sessionsFile);

        axios.post(
          `/konter/sessions/${this.currentEvent?.year}/import`, 
          sessionsFormData, {
            headers: {
              "Content-Type": 'multipart/form-data'
            }
          }
        ).then(() => {
          if(!this.evaluationsFile) return;

          const evaluationsFormData = new FormData();
          evaluationsFormData.append('file', this.evaluationsFile);

          axios.post(
            '/konter/sessions/evaluations/import', 
            evaluationsFormData, {
              headers: {
                "Content-Type": 'multipart/form-data'
              }
            }
          ).then(() => {
            this.importModal = false;
            this.loadSessions();
          }).catch(() => {
            this.importModal = false;
          }).finally(() => {
            this.loading = false;
          })

        }).catch(() => {
          this.importModal = false;
        })

      }).catch(() => {
        this.importModal = false;
      })
    },

    exportPDFCards () {
      axios.get(
        `/konter/sessions/${this.currentEvent?.id}/export`, 
        { responseType: "blob" }
      ).then((response) => 
        downloadPdfWithName(response, `session_cards_${this.currentEvent?.name}.pdf`)
      )
    },

    onSpeakersFileSelected (event: Event) {
      const target = event.target as HTMLInputElement;
      this.speakersFile = target.files?.item(0) ?? null; 
    },
    
    onSessionsFileSelected (event: Event) {
      const target = event.target as HTMLInputElement;
      this.sessionsFile = target.files?.item(0) ?? null; 
    },

    onEvaluationsFileSelected (event: Event) {
      const target = event.target as HTMLInputElement;
      this.evaluationsFile = target.files?.item(0) ?? null;
    },

    backToTop () {
      scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    },
  }
});
</script>
