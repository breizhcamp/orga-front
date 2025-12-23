<template>
  <div class="card">
    <div class="card-header px-3 d-flex align-items-center">
      <h4 class="flex-grow-1 m-0">
        <a v-if="event.website" class="nav-link" :href="event.website.toString()">
          {{ event.name }}
        </a>
        <span v-else class="nav-link">
          {{ event.name }}
        </span>
      </h4>
      <div class="float-end d-flex align-items-center">
        <button
          v-if="editRights"
          type="button"
          class="btn mx-1 btn-sm btn-warning opacity-75 flex-shrink-1 float-end d-flex align-items-center"
          @click="eventModal = true"
        >
          <BiPencilSquare class="me-1" aria-hidden="true"/>
          Edit
        </button>
        <button
          v-if="editRights"
          type="button"
          class="btn btn-sm btn-danger d-flex align-items-center"
          @click="deleteEvent()"
        >
          <BiTrash class="me-1" aria-hidden="true"/>Delete
        </button>
      </div>
    </div>
    <div class="card-body row row-cols-2">
      <div class="col">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <h5 class="flex-grow-1 mb-0">Key dates</h5>
        </div>
        <ul class="p-0">
          <li class="d-flex justify-content-between">
            <span>Event start: </span>
            <i>{{ event.debutEvent?.toLocaleDateString() || 'Undefined' }}</i>
          </li>
          <li class="d-flex justify-content-between">
            <span>Event end: </span>
            <i>{{ event.finEvent?.toLocaleDateString() || 'Undefined' }}</i>
          </li>
          <li class="d-flex justify-content-between">
            <span>CFP start: </span>
            <i>{{ event.debutCFP?.toLocaleDateString() || 'Undefined' }}</i>
          </li>
          <li class="d-flex justify-content-between">
            <span>CFP end: </span>
            <i>{{ event.finCFP?.toLocaleDateString() || 'Undefined' }}</i>
          </li>
          <li class="d-flex justify-content-between">
            <span>Inscriptions start: </span>
            <i>{{ event.debutInscription?.toLocaleDateString() || 'Undefined' }}</i>
          </li>
          <li class="d-flex justify-content-between">
            <span>Inscriptions end: </span>
            <i>{{ event.finInscription?.toLocaleDateString() || 'Undefined' }}</i>
          </li>
        </ul>
      </div>
      <div class="col">
        <h5>Slots</h5>
        <div class="row row-cols-2 align-items-center gy-1">
          <span class="col">Days: {{ getEventDays(event).length }}</span>
          <RouterLink :to="'/events/program/'+event.id" custom v-slot="{ navigate }">
            <button
              type="button"
              class="btn mx-auto btn-sm btn-primary col-5"
              @click="navigate"
            >See program</button>
          </RouterLink>
        </div>

        <h5>Other information</h5>
        <div class="row row-cols-2 align-items-center gy-1">
          <span class="col">Members: {{
            (event.participants as EventParticipants).getMemberIds().length
          }}</span>
          <button
            type="button"
            class="btn mx-auto btn-sm btn-primary col-5"
            @click="membersModal = true"
          >See members</button>

          <span class="col">Teams: {{
            (event.participants as EventParticipants).getTeamIds().length
          }}</span>
          <button
            type="button"
            class="btn mx-auto btn-sm btn-primary col-5"
            @click="teamsModal = true"
          >See teams</button>
        </div>
      </div>
    </div>
  </div>

  <ModalForm
    v-model:open="eventModal"
    :title="'Edit ' + event.name"
    @save="updateEvent()"
  >
    <div class="row row-cols-2 gy-3">
      <div class="col-12">
        <label for="eventName" class="form-label">Name</label>
        <input
          type="text"
          id="eventName"
          class="form-control"
          :value="formValues.name"
          @input="e => formValues.name = (e.target as HTMLInputElement).value"
        >
      </div>
      <div>
        <label for="eventYear" class="form-label">Year</label>
        <input
          type="number"
          id="eventYear"
          class="form-control"
          :value="formValues.year"
          @input="e => formValues.year = Number((e.target as HTMLInputElement).value)"
        >
      </div>
      <div>
        <label for="eventWebsite" class="form-label">Website</label>
        <input
          type="url"
          id="eventWebsite"
          class="form-control"
          :value="formValues.website"
          @input="e => formValues.website = (e.target as HTMLInputElement).value"
        >
      </div>
      <div>
        <label for="debEvent" class="form-label">Event start</label>
        <input
          type="date"
          id="debEvent"
          class="form-control"
          :value="formValues?.debutEvent"
          @change="changeDebutEvent($event)"
        >
      </div>
      <div>
        <label for="finEvent" class="form-label">Event end</label>
        <input
          type="date"
          id="finEvent"
          class="form-control"
          :value="formValues?.finEvent"
          @change="changeFinEvent($event)"
        >
      </div>
      <div>
        <label for="debCfp" class="form-label">CFP start</label>
        <input
          type="date"
          id="debCfp"
          class="form-control"
          :value="formValues?.debutCFP"
          @change="changeDebutCFP($event)"
        >
      </div>
      <div>
        <label for="finCfp" class="form-label">CFP end</label>
        <input
          type="date"
          id="finCfp"
          class="form-control"
          :value="formValues?.finCFP"
          @change="changeFinCFP($event)"
        >
      </div>
      <div>
        <label for="debIncsr" class="form-label">Inscriptions start</label>
        <input
          type="date"
          id="debInscr"
          class="form-control"
          :value="formValues?.debutInscription"
          @change="changeDebutInscription($event)"
        >
      </div>
      <div>
        <label for="finInscr" class="form-label">Inscriptions end</label>
        <input
          type="date"
          id="finInscr"
          class="form-control"
          :value="formValues?.finInscription"
          @change="changeFinInscription($event)"
        >
      </div>
    </div>
  </ModalForm>

  <ModalInfo v-model:open="membersModal" v-bind:title="'Members of ' + event.name">
    <ul class="list-group">
      <li class="list-group-item" v-for="member in members.sort((a, b) => a.id.localeCompare(b.id))" :key="member.id">
        <EventMemberListItem :member="member" :event-id="Number(event.id)" :event-teams="teams" @reload="reloadMembers()" />
      </li>
    </ul>
  </ModalInfo>

  <ModalInfo v-model:open="teamsModal" :title="'Teams of ' + event.name">
    <ul class="list-group">
      <li class="list-group-item" v-for="team in teams" :key="team.id">
        <EventTeamListItem :team="team" :event-id="Number(event.id)" :editable="editRights"/>
      </li>
      <li v-if="availableTeams.length !== teams.length" class="list-group-item">
        <div class="dropdown" id="team-dropdown">
          <button
            type="button"
            class="btn btn-success dropdown-toggle"
            data-bs-toggle="dropdown"
            :class="computeAddTeamDropdownClass()"
            @click="addTeamDropdown = !addTeamDropdown"
          >
            Add&nbsp;
          </button>
          <ul class="dropdown-menu" :class="addTeamDropdown ? 'show' : ''">
            <li
              v-for="team in availableTeams
                .filter(t => !teams.map(t => t.id).includes(t.id))"
              :key="team.id"
              class="d-grid gap-2"
            >
              <button
                type="button"
                class="btn btn-sm btn-light"
                @click="addTeamModal(team)"
              >
                {{ team.name }}
              </button>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </ModalInfo>

  <ModalForm v-model:open="addTeamModalOpen" :title="'Add team ' + addTeamModalTeam?.name + ' to the event ' + event.name" @save="addTeamWithMembers()">
    <p>To add <i>{{ addTeamModalTeam?.name }}</i> team to the event, at least one member has to be part of the team for the event</p>
    <form @submit.prevent="addMemberToTeam()">
      <label for="memberList" class="form-label">Search</label>
      <div class="input-group">
        <select class="form-select" list="options" id="memberList" v-model="selectedMember">
          <option :value="undefined">New member</option>
          <option v-for="member in availableMembers" :key="member.id" :value="member">
            {{ member.lastname + ' ' + member.firstname }}
          </option>
        </select>
        <button
          type="submit"
          class="btn btn-success"
        >
          Add&nbsp;
        </button>
      </div>
      <ul class="list-group">
        <li class="list-group-item d-flex align-items-center" v-for="member in selectedMembers" :key="member.id">
          <button type="button" class="btn rounded-pill btn-danger btn-sm me-2" @click="removeMember(member)">Remove</button>
          {{ member.firstname + ' ' + member.lastname }}
        </li>
      </ul>
    </form>
  </ModalForm>

  <ModalForm v-model:open="newMemberModal" title="Add a new member" @save="addMember()">
    <div class="mb-3">
      <label for="lastname">Lastname</label>
      <input type="text" class="form-control" id="lastname" v-model="memberPartial.lastname">
    </div>
    <div class="mb-3">
      <label for="firstname">Firstname</label>
      <input type="text" class="form-control" id="firstname" v-model="memberPartial.firstname">
    </div>
  </ModalForm>
</template>

<script lang="ts">
import { type PropType, defineComponent, inject } from 'vue';
import { type EventDTO, EventParticipants, type EventInfos } from '@/dto/EventDTO';
import { MemberParticipations, type Member } from "@/dto/Member";
import EventMemberListItem from '@/components/EventMemberListItem.vue';
import EventTeamListItem from '@/components/EventTeamListItem.vue';
import ModalInfo from '@/components/modals/ModalInfo.vue';
import ModalForm from '@/components/modals/ModalForm.vue';
import { TeamParticipations, type Team } from '@/dto/Team';
import BiPencilSquare from 'bootstrap-icons/icons/pencil-square.svg?component';
import BiTrash from 'bootstrap-icons/icons/trash.svg?component'
import dayjs, { Dayjs } from 'dayjs';
import type { Hall } from '@/dto/Hall';
import axios, { type AxiosResponse } from 'axios';
import type Keycloak from 'keycloak-js';
import { keycloakKey } from '@/provide-keys'

export interface EventOptions {
  members: boolean
  teams: boolean
}

export default defineComponent({
  name: "EventCard",

  components: { ModalInfo, ModalForm, EventMemberListItem, EventTeamListItem, BiPencilSquare, BiTrash },

  props: {
    event: { type: Object as PropType<EventDTO>, required: true },
    options: { type: Object as PropType<EventOptions>, required: true },
    halls: { type: Array<Hall>, required: true }
  },

  emits: ['reload', 'reload-members', 'reload-teams'],

  data() {
    return {
      membersModal: this.options.members,
      members: [] as Member[],
      teamsModal: this.options.teams,
      teams: [] as Team[],
      addTeamDropdown: false,
      availableTeams: [] as Team[],
      availableMembers: [] as Member[],
      availableHalls: [] as Hall[],
      addTeamModalOpen: false,
      addTeamModalTeam: null as Team | null,
      selectedMember: undefined as Member | undefined,
      selectedMembers: new Set<Member>() as Set<Member>,
      newMemberModal: false,
      memberPartial: {} as { lastname: string, firstname: string },
      eventModal: false,
      formValues: {} as EventInfos,
      editRights: (inject(keycloakKey) as Keycloak).hasRealmRole("admin")
    }
  },

  watch: {
    teamsModal() {
      if (!this.teamsModal) { this.addTeamDropdown = false }
    }
  },

  mounted() {
    this.load()
    this.formValues = {
      debutEvent: this.event.debutEvent?.toISOString().split('T')[0],
      finEvent: this.event.finEvent?.toISOString().split('T')[0],
      debutCFP: this.event.debutCFP?.toISOString().split('T')[0],
      finCFP: this.event.finCFP?.toISOString().split('T')[0],
      debutInscription: this.event.debutInscription?.toISOString().split('T')[0],
      finInscription: this.event.finInscription?.toISOString().split('T')[0],
      name: this.event.name,
      year: this.event.year,
      website: this.event.website
    }
  },

  methods: {
    load() {
      const participantsAsClass = (this.event.participants as EventParticipants);
      this.loadMembers(participantsAsClass.getMemberIds());
      this.loadTeams(participantsAsClass.getTeamIds());
      this.loadAvailableHalls();
      this.loadAllTeams();
      this.loadAllMembers();
    },

    loadMembers(ids: Array<string>) {
      this.members = [];

      ids.forEach((id) => {
        axios.get('/kalon/members/' + id).then((response: AxiosResponse<Member>) => {
          const member = { ...response.data }
          member.participations = new MemberParticipations(member.participations as Array<any>)
          this.members.push(member);
        })
      })
    },

    loadTeams(ids: Array<string>) {
      this.teams = [];

      ids.forEach(id =>
        axios.get('/kalon/teams/' + id).then((response: AxiosResponse<Team>) => {
          const team = { ...response.data }
          team.participations = new TeamParticipations(team.participations as Array<any>)
          this.teams.push(team)
        })
      )
    },

    loadAvailableHalls() {
      this.availableHalls = [];

      axios.get("/konter/halls/" + this.event.id).then((response: AxiosResponse<Hall[]>) => this.availableHalls = response.data)
    },

    loadAllTeams() {
      this.availableTeams = [];
      axios.get('/kalon/teams').then((response: AxiosResponse<Array<string>>) => {
        response.data.forEach(id =>
          axios.get('/kalon/teams/' + id).then((response: AxiosResponse<Team>) =>
            this.availableTeams.push(response.data)
          )
        )
      })
    },

    loadAllMembers() {
      this.availableMembers = [];
      axios.get('/kalon/members').then((response: AxiosResponse<Array<string>>) =>
        response.data.forEach(id =>
          axios.get('/kalon/members/' + id).then((response: AxiosResponse<Member>) =>
            this.availableMembers.push(response.data)
          )
        )
      )
    },

    addTeamModal(team: Team) {
      this.addTeamModalTeam = team;
      this.addTeamDropdown = false;
      this.addTeamModalOpen = true;
    },

    addMemberToTeam() {
      if (this.selectedMember) {
        this.selectedMembers.add(this.selectedMember)
      } else {
        this.newMemberModal = true
      }
    },

    removeMember(member: Member) {
      this.selectedMembers.delete(member)
    },

    addMember() {
      if (this.memberPartial.firstname && this.memberPartial.lastname) {
        axios.post('/kalon/members', this.memberPartial).then(() => {
          this.loadAllMembers();
          this.newMemberModal = false;
        })
      }
    },

    addTeamWithMembers() {
      if (this.addTeamModalTeam == undefined) return
      const eventId = this.event.id;
      const teamId = this.addTeamModalTeam.id;
      const memberIds = Array.from(this.selectedMembers.keys()).map((entry) => entry.id);
      const total = memberIds.length;
      let current = 0;

      memberIds.forEach(memberId =>
        axios.post(`/kalon/events/${eventId}/participants/${memberId}/${teamId}`).then(() => {
          current++;
          if (current === total) {
            this.addTeamModalOpen = false
            this.teamsModal = false
            this.$emit('reload-teams');
          }
        })
      )
    },

    computeAddTeamDropdownClass() {
      const className = [];
      if (this.addTeamDropdown) {
        className.push('show')
      }
      if (this.availableTeams.filter(t => !this.teams.map(t => t.id).includes(t.id)).length == 0) {
        className.push('disabled')
      }
      return className.join(' ')
    },

    updateEvent() {
      axios.post('/kalon/events/' + this.event.id, this.formValues).then(
        () => this.$emit('reload')
      )
    },

    reloadMembers() {
      this.$emit('reload-members');
    },

    changeDebutEvent(event: Event) {
      if (this.formValues == undefined) return;
      const target = event.target as HTMLInputElement;
      this.formValues.debutEvent = target.value.toString();
    },

    changeFinEvent(event: Event) {
      if (this.formValues == undefined) return;
      const target = event.target as HTMLInputElement;
      this.formValues.finEvent = target.value.toString();
    },

    changeDebutCFP(event: Event) {
      if (this.formValues == undefined) return;
      const target = event.target as HTMLInputElement;
      this.formValues.debutCFP = target.value.toString();
    },

    changeFinCFP(event: Event) {
      if (this.formValues == undefined) return;
      const target = event.target as HTMLInputElement;
      this.formValues.finCFP = target.value.toString();
    },

    changeDebutInscription(event: Event) {
      if (this.formValues == undefined) return;
      const target = event.target as HTMLInputElement;
      this.formValues.debutInscription = target.value.toString();
    },

    changeFinInscription(event: Event) {
      if (this.formValues == undefined) return;
      const target = event.target as HTMLInputElement;
      this.formValues.finInscription = target.value.toString();
    },

    getEventDays(event: EventDTO): { index: number, date: Dayjs }[] {
      if (
        event.debutEvent == undefined ||
        event.finEvent == undefined ||
        dayjs(event.debutEvent).isAfter(dayjs(event.finEvent))
      ) {
        return []
      }

      return Array.from(
          Array(dayjs(event.finEvent).diff(dayjs(event.debutEvent), 'days') + 1)
          .keys()
        ).map(n => {return {
          index: n + 1,
          date: dayjs(event.debutEvent).add(n, "days")
        }})
    },

    deleteEvent() {
      axios.delete("/kalon/events/" + this.event.id).then(() => this.$emit('reload'))
    }
  }
})
</script>

<style>
.modal-backdrop {
  visibility: hidden !important;

}
.modal {
  background-color: rgba(0,0,0,0.5);
}
</style>
