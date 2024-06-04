<template>
  <div class="card">
    <h5 class="card-header">
      <a :href="event.website?.toString()">
        {{ event.name }}
      </a>
      <span class="float-end fs-6">
        Year: {{ event.year }}
      </span>
    </h5>
    <div class="card-body row row-cols-2">
      <div class="col">
        <div class="d-flex align-items-center justify-content-between mb-1"> 
          <h5 class="flex-grow-1 mb-0">Key dates</h5>
          <button 
            type="button" 
            class="btn btn-sm btn-warning opacity-75 flex-shrink-1 float-end d-flex align-items-center" 
            @click="dateModal = true"
          >
            <BiPencilSquare class="me-1" />
            Edit
          </button>
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
          <span class="col-7">Days: {{ getEventDays(event).length }}</span>
          <button 
            type="button" 
            class="btn btn-sm btn-primary col-5"
            @click="programModal = true" 
          >See slots</button>
        </div>

        <h5>Other information</h5>
        <div class="row row-cols-2 align-items-center gy-1">
          <span class="col-7">Members: {{ 
            (event.participants as EventParticipants).getMemberIds().length 
          }}</span>
          <button 
            type="button" 
            class="btn btn-sm btn-primary col-5"
            @click="membersModal = true" 
          >See members</button>

          <span class="col-7">Teams: {{ 
            (event.participants as EventParticipants).getTeamIds().length 
          }}</span>
          <button 
            type="button" 
            class="btn btn-sm btn-primary col-5"
            @click="teamsModal = true" 
          >See teams</button>
        </div>
      </div>
    </div>
  </div>

  <ModalForm 
    v-model:open="dateModal" 
    :title="'Edit dates for ' + event.name" 
    @save="updateDates()"
  >
    <div class="mb-3">
      <label for="debEvent" class="form-label">Event start</label>
      <input 
        type="date" 
        id="debEvent" 
        class="form-control" 
        :value="dates?.debutEvent" 
        @change="changeDebutEvent($event)"
      >
    </div>
    <div class="mb-3">
      <label for="finEvent" class="form-label">Event end</label>
      <input 
        type="date" 
        id="finEvent" 
        class="form-control" 
        :value="dates?.finEvent" 
        @change="changeFinEvent($event)"
      >
    </div>
    <div class="mb-3">
      <label for="debCfp" class="form-label">CFP start</label>
      <input 
        type="date" 
        id="debCfp" 
        class="form-control" 
        :value="dates?.debutCFP" 
        @change="changeDebutCFP($event)"
      >
    </div>
    <div class="mb-3">
      <label for="finCfp" class="form-label">CFP end</label>
      <input 
        type="date" 
        id="finCfp" 
        class="form-control" 
        :value="dates?.finCFP" 
        @change="changeFinCFP($event)"
      >
    </div>
    <div class="mb-3">
      <label for="debIncsr" class="form-label">Inscriptions start</label>
      <input 
        type="date" 
        id="debInscr" 
        class="form-control" 
        :value="dates?.debutInscription" 
        @change="changeDebutInscription($event)"
      >
    </div>
    <div class="mb-3">
      <label for="finInscr" class="form-label">Inscriptions end</label>
      <input 
        type="date" 
        id="finInscr" 
        class="form-control" 
        :value="dates?.finInscription" 
        @change="changeFinInscription($event)"
      >
    </div>
  </ModalForm>

  <ProgramModal
    :open="programModal"
    @close="programModal = false"
    @reload="$emit('reload-slots')"
    :event="event"
    :available-halls="availableHalls"
    :halls="halls"
  />

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
        <EventTeamListItem :team="team" :event-id="Number(event.id)"/>
      </li>
      <li class="list-group-item">
        <label for="team-dropdown" class="form-label text-muted" v-if="availableTeams.filter(t => !teams.map(t => t.id).includes(t.id)).length == 0">
          <i>This button is disabled, as all teams are already part of this event</i>
        </label>
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
          <option :value="undefined"><i>New member</i></option>
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
import { type PropType, defineComponent } from 'vue';
import { type EventDTO, EventParticipants, type EventDates } from '@/dto/EventDTO';
import { MemberParticipations, type Member } from "@/dto/Member";
import EventMemberListItem from '@/components/EventMemberListItem.vue';
import EventTeamListItem from '@/components/EventTeamListItem.vue';
import ModalInfo from '@/components/ModalInfo.vue';
import ModalForm from '@/components/ModalForm.vue';
import ProgramModal from '@/components/ProgramModal.vue';
import { TeamParticipations, type Team } from '@/dto/Team';
import BiPencilSquare from 'bootstrap-icons/icons/pencil-square.svg?component';
import dayjs, { Dayjs } from 'dayjs';
import type { Hall } from '@/dto/Hall';
import axios, { type AxiosResponse } from 'axios';

export interface EventOptions {
  members: boolean
  teams: boolean
  slots: boolean
}

export default defineComponent({
  name: "EventCard",

  components: { ModalInfo, ModalForm, EventMemberListItem, EventTeamListItem, ProgramModal, BiPencilSquare },

  props: {
    event: { type: Object as PropType<EventDTO>, required: true },
    options: { type: Object as PropType<EventOptions>, required: true },
    halls: { type: Array<Hall>, required: true }
  },

  emits: ['reload', 'reload-members', 'reload-teams', 'reload-slots'],

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
      dateModal: false,
      dates: undefined as EventDates | undefined,
      programModal: this.options.slots,
    }
  },

  watch: {
    teamsModal() {
      if (!this.teamsModal) { this.addTeamDropdown = false }
    }
  },

  mounted() {
    this.load()
    this.dates = {
      debutEvent: this.event.debutEvent?.toISOString().split('T')[0],
      finEvent: this.event.finEvent?.toISOString().split('T')[0],
      debutCFP: this.event.debutCFP?.toISOString().split('T')[0],
      finCFP: this.event.finCFP?.toISOString().split('T')[0],
      debutInscription: this.event.debutInscription?.toISOString().split('T')[0],
      finInscription: this.event.finInscription?.toISOString().split('T')[0]
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

    updateDates() {
      axios.post('/kalon/events/' + this.event.id, this.dates).then(
        () => this.$emit('reload')
      )
    },

    reloadMembers() {
      this.$emit('reload-members');
    },

    changeDebutEvent(event: Event) {
      if (this.dates == undefined) return;
      const target = event.target as HTMLInputElement;
      this.dates.debutEvent = target.value.toString();
    },

    changeFinEvent(event: Event) {
      if (this.dates == undefined) return;
      const target = event.target as HTMLInputElement;
      this.dates.finEvent = target.value.toString();
    },

    changeDebutCFP(event: Event) {
      if (this.dates == undefined) return;
      const target = event.target as HTMLInputElement;
      this.dates.debutCFP = target.value.toString();
    },

    changeFinCFP(event: Event) {
      if (this.dates == undefined) return;
      const target = event.target as HTMLInputElement;
      this.dates.finCFP = target.value.toString();
    },

    changeDebutInscription(event: Event) {
      if (this.dates == undefined) return;
      const target = event.target as HTMLInputElement;
      this.dates.debutInscription = target.value.toString();
    },

    changeFinInscription(event: Event) {
      if (this.dates == undefined) return;
      const target = event.target as HTMLInputElement;
      this.dates.finInscription = target.value.toString();
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
