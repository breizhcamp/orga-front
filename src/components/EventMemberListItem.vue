<template>
  <div class="d-flex flex-grow-1 align-items-center justify-content-between">
    <div class="d-flex align-items-center me-auto flex-wrap">
      <img
        v-if="member.profilePictureLink"
        :src="member.profilePictureLink"
        class="member-profile"
        style="object-fit: cover;"
      >
      <div
        v-else
        class="member-profile d-inline-flex fs-6"
        :style="nameToStyle(member)"
      >
        <b class="m-auto">{{ member.firstname[0] }}</b>
      </div>
      <b class="ms-1 text-wrap">{{ member.firstname + ' ' + member.lastname }}</b>
      <i class="text-muted text-wrap" v-if="editable">&nbsp;({{ member.contacts.length }} contact methods)</i>
    </div>
    <div v-if="editable" class="d-flex flex-row-reverse flex-wrap align-items-center flex-shrink-1">
      <button 
        type="button"
        class="btn btn-sm btn-info opacity-75 d-flex align-items-center m-1"
        @click="contactsModal = true"
      >
        <BiPersonLinesFill class="me-1"/> Contacts
      </button>
      <button 
        type="button" 
        class="btn btn-sm btn-warning opacity-75 d-flex align-items-center m-1"
        @click="openEditModal()"
      >
        <BiPencilSquare class="me-1"/> Edit
      </button>
      <button 
        type="button"   
        class="btn btn-sm btn-danger opacity-75 d-flex align-items-center m-1"
        @click="deleteModal = true"
      >
        <BiTrash class="me-1"/> Delete
      </button>
    </div>
  </div>
  <div v-if="!short">
    Member of :
    <div class="row">
      <div v-for="team in teams" :key="team.id" class="col-auto btn-group">
        <div class="btn btn-sm btn-primary disabled">{{ team.name }}&nbsp;</div>
        <button type="button" class="btn btn-sm btn-danger d-flex align-items-center" @click="removeTeam(team.id)" title="Remove team">
          <BiXLg />
        </button>
      </div>
      <div
        v-if="eventTeams && eventTeams
          .filter(t => !teams.map(t => t.id).includes(t.id)).length !== 0"
        class="col-auto"
      >
        <div class="dropdown">
          <button
            type="button"
            class="btn btn-sm btn-success dropdown-toggle"
            data-bs-toggle="dropdown"
            :class="teamDropdown ? 'show' : null"
            @click="teamDropdown = !teamDropdown"
          >
            Add&nbsp;
          </button>
          <ul
            class="dropdown-menu"
            :class="teamDropdown ? 'show' : null"
          >
            <li
              v-for="team in eventTeams
                .filter(t => !teams.map(t => t.id)
                .includes(t.id))"
              :key="team.id"
              class="d-grid gap-2"
            >
              <button type="button" class="btn btn-sm btn-light" @click="addTeam(team.id)" >{{ team.name }}</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <ModalForm v-model:open="editModal" :title="`Edit ${member.firstname} ${member.lastname}'s information`" @save="submitMember()">
    <div class="alert alert-warning alert-dismissible" role="alert" v-if="editAlert">
      <div>A field with <b style="color: red;">*</b> is empty</div>
      <button type="button" class="btn-close" aria-label="Close" @click="editAlert = false"></button>
    </div>
    <div class="row row-cols-2 gy-3">
      <div class="col">
        <label for="lastname" class="form-label">Lastname<b style="color: red;">*</b></label>
        <input type="text" id="lastname" class="form-control" v-model="memberValues.lastname">
      </div>

      <div class="col">
        <label for="lastname" class="form-label">Firstname<b style="color: red;">*</b></label>
        <input type="text" id="lastname" class="form-control" v-model="memberValues.firstname">
      </div>

      <div class="col-2">
        <div 
          v-if="memberValues.profilePictureLink" 
          class="form-picture position-relative"
        >
          <img
            :src="memberValues.profilePictureLink"
            class="member-profile"
            style="object-fit: cover; z-index: 1;"
          >
          <button 
            type="button" 
            title="Delete" 
            class="position-absolute start-50 btn btn-danger rounded-circle 
            d-flex align-items-center justify-content-center" 
            style="font-size: 0px; padding: 1%; aspect-ratio: 1; top: 0%;"
          >
            <BiTrash aria-hidden viewBox="0 0 16 16" height="8" width="8"/>
          </button>
          <button 
            type="button" 
            title="Upload new picture" 
            class="position-absolute start-50 btn btn-info rounded-circle 
            d-flex align-items-center justify-content-center" 
            style="font-size: 0px; padding: 1%; aspect-ratio: 1; top: 35%"
          >
            <BiUpload aria-hidden viewBox="0 0 16 16" height="8" width="8"/>
          </button>
        </div>
        <button
          v-else
          class="member-profile form-picture d-inline-flex fs-6 
          align-items-center justify-content-center btn btn-sm btn-light"
        >
          <BiUpload />
        </button>
      </div>
      <div class="col-10">
        <label for="profile-picture" class="form-label">Profile picture</label>
        <input 
          type="text" 
          id="profile-picture" 
          class="form-control" 
          :value="memberValues.profilePictureLink"
        >
      </div>

      <div class="col-12">
        <i class="text-muted">
          Fields with an <b style="color: red;">*</b> must not be empty
        </i>
      </div>
    </div>
  </ModalForm>

  <ModalForm v-model:open="contactsModal" :title="`Edit ${member.firstname} ${member.lastname}'s contact methods`">
    <div class="col">
      <ul class="list-group">
        <li v-for="[index, contact] in member.contacts.entries()" :key="index" class="list-group-item" :class="index % 2 === 0 ? 'list-group-item-dark' : 'list-group-item-light'">
          <b>{{ contact.platform }}</b>: {{ contact.link }}
        </li>
        <li class="list-group-item" :class="member.contacts.length % 2 === 0 ? 'list-group-item-dark' : 'list-group-item-light'">
          <div class="row">
            <div class="col col-5"><input type="text" class="form-control"></div>
            <div class="col col-5"><input type="text" class="form-control"></div>
            <div class="col col-2">
              <button type="button" class="btn btn-success">
                Add
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </ModalForm>

</template>

<script lang="ts">
import { type PropType, defineComponent, type CSSProperties } from 'vue';
import { MemberParticipations, type Member } from '@/dto/Member';
import { type Team } from '@/dto/Team';
import ModalForm from './ModalForm.vue';
import BiXLg from 'bootstrap-icons/icons/x-lg.svg?component';
import BiPersonLinesFill from 'bootstrap-icons/icons/person-lines-fill.svg?component';
import BiPencilSquare from 'bootstrap-icons/icons/pencil-square.svg?component';
import BiTrash from 'bootstrap-icons/icons/trash.svg?component';
import BiUpload from 'bootstrap-icons/icons/upload.svg?component';
import axios, { type AxiosResponse } from 'axios';

export default defineComponent({
  name: "EventMemberListItem",

  components: { ModalForm, BiXLg, BiPersonLinesFill, BiPencilSquare, BiTrash, BiUpload },

  props: {
    member: { type: Object as PropType<Member>, required: true },
    eventId: { type: Number, required: false },
    eventTeams: { type: Object as PropType<Array<Team>>, required: false },
    short: { type: Boolean, required: false, default: false },
    editable: { type: Boolean, required: false, default: false }
  },

  emits: ['reload'],

  data() {
    return {
      teams: [] as Team[],
      teamDropdown: false,
      editModal: false,
      editAlert: false,
      deleteModal: false,
      memberValues: { 
        lastname: this.member.lastname, 
        firstname: this.member.firstname, 
        profilePictureLink: this.member.profilePictureLink 
      },
      contactsModal: false
    }
  },

  mounted() {
    if (!this.short && this.eventId) {
      this.loadTeams((this.member.participations as MemberParticipations).getTeamIds(this.eventId))
    }
  },

  methods: {
    loadTeams(ids: Array<string>) {
      this.teams = [];
      ids.forEach((id) => 
        axios.get('/kalon/teams/' + id).then((response: AxiosResponse<Team>) => {
          this.teams.push(response.data)
        })
      )
    },

    addTeam(teamId: string) {
      axios.post(`/kalon/members/${this.member.id}/participation/${this.eventId}/${teamId}`).then(
        () => this.$emit('reload')
      )
    },

    removeTeam(teamId: string) {
      axios.delete(`/kalon/members/${this.member.id}/participation/${this.eventId}/${teamId}`).then(
        () => this.$emit('reload')
      )
    },

    openEditModal() {
      this.memberValues = {
        firstname: this.member.firstname,
        lastname: this.member.lastname,
        profilePictureLink: this.member.profilePictureLink
      };
      this.editAlert = false;
      this.editModal = true;
    },

    submitMember() {
      if (
        this.memberValues.firstname == undefined || this.memberValues.firstname.length === 0 ||
        this.memberValues.lastname == undefined || this.memberValues.lastname.length === 0
      ) {
        this.editAlert = true;
        return;
      }

      this.editAlert = false;
      axios.post('')
    },
    
    nameToStyle(member: Member): CSSProperties {
      const name = member.lastname + member.firstname + "padding"
      let value = 0;
      
      // Simple hash to get icon color as hex
      for(let i = 0; i < name.length; i++) {
        const code = name.charCodeAt(i);
        value += (code + code * value);
        value &= 0xFFFFFF;
      }

      const backgroundColor = "#" + value.toString(16);
      const [r, g, b] = [
        (value >> 16) & 0xFF,
        (value >> 8) & 0xFF,
        value & 0xFF,
      ];

      // Text and border color determined by the luminance of the background to
      // maximise contrast
      const textColor = (
        0.2126 * r / 256 + 
        0.7152 * g / 256 + 
        0.0722 * b / 256
      ) < 0.5 ? "#EAEAEA" : "#181818";

      return {
        backgroundColor,
        color: textColor,
        borderColor: textColor,
        borderWidth: "1px",
        borderStyle: "solid"
      } as CSSProperties
    }
  }
})
</script>

<style>
ul.list > li > * {
  display: inline-table;
  vertical-align: middle;
}

.form-picture {
  transform: scale(2) translate(25%, 25%);
}
</style>