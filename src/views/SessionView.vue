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
            @click="currentEvent = event; openYearDropdown = false"
          >
            {{ event.name }}
          </button>
        </li>
      </ul>
    </div>

    <SessionFilter v-model:filter="filter" @filter="(f) => loadSessions(f)" :loseFocus="forceModalOpen" />
    <div id="infinite-scroll">
      <SessionCard
        v-for="[index ,session] in sessions.entries()"
        :key="session.id"
        :index="index"
        :last="index === sessions.length - 1"
        :session="session"
        :availableHalls="halls"
        :slots="currentEvent?.slots"
        :forceModal="forceModalOpen"
        :event-start="currentEvent?.debutEvent ? new Date(currentEvent.debutEvent) : new Date(Date.now())"
        @reload="reloadSessions()"
        @focus-back-to-top="focusBackToTop()"
      />
    </div>

    <div v-if="loading" class="d-flex justify-content-center">
      <div class="spinner-border mt-3" style="width: 6rem; height: 6rem;" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

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

  <ModalForm v-model:open="importScheduleModal" :loading="loading" title="Import Schedule" @save="importSchedule()">
    <!-- Description -->
    <div class="mb-3">
      <h5>Import schedule</h5>
      To get the schedule file:
      <ol>
        <li>Go to the event dashboard > Export</li>
        <li>Download the <code>Everything in a single file</code> option</li>
        <li>Save the <code>Accepted sessions</code> worksheets as CSV <b>with <code>UTF-8</code> format</b></li>
      </ol>
    </div>

    <!-- Schedule File -->
    <div class="mb-3">
      <b>Schedule File</b><br/>
      Format (with header) : Session Id, Title, Description, Owner, Owner Email, Speakers,
      Format, Thème, Niveau, Additional notes, Owner Informed, Owner Confirmed,
      Room, Scheduled At, Scheduled Duration, Live Link, Recording Link, Speaker Ids
    </div>
    <div class="mb-3">
      <input
        type="file"
        class="form-control"
        id="schedule-file"
        accept="text/csv"
        @change="onScheduleFileSelected($event)"
      >
    </div>
  </ModalForm>

  <button
    type="button"
    id="back-to-top"
    class="btn btn-light border border-dark border-2 m-1 rounded-pill position-fixed bottom-0 end-0"
    @click="backToTop"
  >
    <p class="d-inline mx-1 fs-6">Back to top</p>
    <BiArrowUpCircleFill viewBox="0 0 16 16" height="32" width="32"/>
  </button>

</template>

<script lang="ts">
/// <reference types="vite-svg-loader" />

import ModalForm from '@/components/modals/ModalForm.vue';
import ToolBar from '@/components/ToolBar.vue';
import SessionCard from '@/components/SessionCard.vue';
import SessionFilter from '@/components/SessionFilter.vue'
import type { SessionFilter as Filter } from '@/dto/SessionFilter';
import type { Session, SessionDTO } from '@/dto/Session';
import { sessionDTOToSession } from '@/dto/Session';
import type { Action } from '@/dto/Action';
import type { EventDTO } from '@/dto/EventDTO';
import axios, { type AxiosResponse } from 'axios';
import BiFilePdf from 'bootstrap-icons/icons/file-pdf.svg?component'
import BiDatabaseUp from 'bootstrap-icons/icons/database-up.svg?component'
import BiArrowUpCircleFill from 'bootstrap-icons/icons/arrow-up-circle-fill.svg?component'
import { defineComponent, inject, shallowRef } from 'vue';
import type { Hall } from '@/dto/Hall';
import type { Slot } from '@/dto/Slot';
import { downloadPdfWithName } from '@/utils/download';
import type { Page } from '@/dto/Page';
import { keycloakKey } from '@/provide-keys'
import type Keycloak from 'keycloak-js'

const equalsFilter = (that?: Filter, other?: Filter): boolean => {
  if (that == undefined || other == undefined) return true;
  if ((that == undefined && other != undefined) && (that != undefined && other == undefined)) return false;

  if (that == null && other == null) return true;
  if ((that == null && other != null) || (that != null && other == null)) return false;

  if (that == other) return true;

  if (that.format != other.format) return false;
  if (that.id != other.id) return false;
  if (that.niveau != other.niveau) return false;
  if (that.rated != other.rated) return false;
  if (that.speakerName != other.speakerName) return false;
  if (that.status != other.status) return false;
  if (that.theme != other.theme) return false;
  if (that.title != other.title) return false;

  return true;
}

const cleanFilter = (filter: Filter): Filter => {
  let result: Filter = {};
  if (filter.format != undefined) {
    result.format = filter.format;
  }
  if (filter.id != undefined) {
    result.id = filter.id;
  }
  if (filter.niveau != undefined) {
    result.niveau = filter.niveau;
  }
  if (filter.rated != undefined) {
    result.rated = filter.rated;
  }
  if (filter.speakerName != undefined) {
    result.speakerName = filter.speakerName;
  }
  if (filter.status != undefined) {
    result.status = filter.status;
  }
  if (filter.theme != undefined) {
    result.theme = filter.theme;
  }
  if (filter.title != undefined) {
    result.title = filter.title;
  }
  if (filter.format != undefined) {
    result.format = filter.format;
  }

  return result
}

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
      currentPage: 0 as number,
      hasNext: true as boolean,
      events: [] as EventDTO[],
      halls: [] as Hall[],
      sessions: [] as Session[],
      loading: false,
      importModal: false,
      importScheduleModal: false,
      exportModal: false,
      openYearDropdown: false,
      speakersFile: null as File | null,
      sessionsFile: null as File | null,
      evaluationsFile: null as File | null,
      scheduleFile: null as File | null,
      actions: [] as Action[],
      filter: {} as Object,
      filterById: false,
      eventCount: { total: 0, current: 0 },
      forceModalOpen: false,
      editRights: (inject(keycloakKey) as Keycloak).hasRealmRole("admin")
    }
  },

  mounted() {
    window.addEventListener("scroll", this.handleScroll);

    this.actions = [{
      label: "Export session cards as PDF",
      title: "Export",
      function: () => { this.exportPDFCards() },
      // @ts-ignore : We pass a shallowRef instead of the component
      icon: shallowRef(BiFilePdf)
    }];

    if (this.editRights) {
      this.actions.push({
        label: "Import data as CSV",
        title: "Import",
        function: () => { this.importModal = true },
        // @ts-ignore : We pass a shallowRef instead of the component
        icon: shallowRef(BiDatabaseUp)
      });
      this.actions.push({
        label: "Import schedule",
        title: "Import Schedule",
        function: () => { this.importScheduleModal = true },
        // @ts-ignore : We pass a shallowRef instead of the component
        icon: shallowRef(BiDatabaseUp)
      });
    }

    this.loadOnMounted();
  },

  unmounted() {
    window.removeEventListener("scroll", this.handleScroll)
  },

  watch: {
    currentEvent() {
      this.resetPage();
      this.loadSessions(this.filter);
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

          this.resetPage();
          this.loadSessions(this.filter);
          this.loadHalls();
        }
      })
    },

    resetPage() {
      this.hasNext = true;
      this.currentPage = 0;
      this.sessions = [];
    },

    loadSessions(filter: Filter) {
      filter = cleanFilter(filter)
      if (!equalsFilter(filter, this.filter)) {
        this.resetPage();
      }
      if (this.loading) return;
      if (!this.hasNext) return;
      if (this.currentEvent == null) return;

      this.loading = true;
      if (filter == null) {
        this.filter = {}

        axios.get(`/konter/sessions/${this.currentEvent.id}/${this.currentPage}`)
        .then((response: AxiosResponse<Page<SessionDTO>>) => {
          this.sessions = this.sessions.concat(response.data.content.map(sessionDTOToSession));
          this.hasNext = !response.data.last;
          this.loading = false;
          this.currentPage++;
        });

      } else {

        this.filterById = filter.id != undefined;
        if (!equalsFilter(this.filter, filter)) {
          this.filter = { ...filter }
          this.resetPage();
        }

        axios.post(
          `/konter/sessions/${this.currentEvent.id}/filter/${this.currentPage}`,
          filter
        ).then((response: AxiosResponse<Page<SessionDTO>>) => {
          this.sessions = this.sessions.concat(response.data.content.map(sessionDTOToSession));
          this.hasNext = !response.data.last;
          this.loading = false;
          this.currentPage++;
          this.forceModalOpen = response.data.content.length === 1 && this.filterById;
        });

      }
    },

    reloadSessions() {
      this.resetPage();
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
          `/konter/sessions/${this.currentEvent?.id}/import`,
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
            this.loadSessions({});
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

    onScheduleFileSelected(event: Event) {
      const target = event.target as HTMLInputElement;
      this.scheduleFile = target.files?.item(0) ?? null;
    },

    importSchedule() {
      if (!this.scheduleFile) return;

      this.loading = true;
      const scheduleFormData = new FormData();
      scheduleFormData.append('file', this.scheduleFile);

      axios.post(
        `/konter/sessions/${this.currentEvent?.id}/import/schedule`,
        scheduleFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      ).then(() => {
        this.importScheduleModal = false;
        this.loadSessions(this.filter);
      }).catch(() => {
        this.importScheduleModal = false;
      }).finally(() => {
        this.loading = false;
      });
    },

    backToTop () {
      const focusNavbarOnEndOfScroll = () => {
        if (window.scrollX === 0) {
          window.removeEventListener('scroll', focusNavbarOnEndOfScroll);
          (document.activeElement as HTMLElement | null)?.blur();
          document.getElementById('sidebar-collapse-button')?.focus();
        }
      }

      window.addEventListener('scroll', focusNavbarOnEndOfScroll);
      scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    },

    focusBackToTop() {
      setTimeout(() => {
        document.getElementById('back-to-top')?.focus();
      }, 100);
    },

    handleScroll() {
      const infiniteScroll = document.getElementById('infinite-scroll')!;
      if (infiniteScroll.getBoundingClientRect().bottom < window.innerHeight) {
        this.loadSessions(this.filter);
      }
    }
  }
});
</script>
