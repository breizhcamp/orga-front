<template>
  <div class="d-flex flex-grow-1 align-items-center justify-content-between">
    <div class="d-flex align-items-center me-auto flex-wrap">
      <ProfilePicture :src="member.profilePictureLink" :name="member.firstname + ' ' + member.lastname" />
      <b class="ms-1 text-wrap">{{ member.firstname + ' ' + member.lastname }}</b>
      <i class="text-muted text-wrap">&nbsp;({{ member.contacts.length }} contact methods)</i>
    </div>
    <div class="d-flex flex-row-reverse flex-wrap align-items-center flex-shrink-1">
      <button 
        type="button"
        class="btn btn-sm btn-info d-flex align-items-center m-1"
        @click="contactsModal = true"
      >
        <BiPersonLinesFill aria-hidden="true" class="me-1"/> Contacts
      </button>
      <button 
        v-if="editable"
        type="button" 
        class="btn btn-sm btn-warning d-flex align-items-center m-1"
        @click="openEditModal()"
      >
        <BiPencilSquare aria-hidden="true" class="me-1"/> Edit
      </button>
      <button 
        v-if="editable"
        type="button"   
        class="btn btn-sm btn-danger d-flex align-items-center m-1"
        @click="deleteModal = true"
      >
        <BiTrash aria-hidden="true" class="me-1"/> Delete
      </button>
    </div>
  </div>
  <div v-if="!short">
    <div class="row mt-2">
      <div v-for="team in teams" :key="team.id" class="col-auto btn-group">
        <div class="btn btn-sm btn-primary disabled">{{ team.name }}&nbsp;</div>
        <button type="button" v-if="editable" class="btn btn-sm btn-danger d-flex align-items-center" @click="removeTeam(team.id)" title="Remove team">
          <BiXLg aria-hidden="true"/>
        </button>
      </div>
      <div
        v-if="editable && eventTeams && eventTeams
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

  <ModalForm v-if="short && editable" v-model:open="editModal" :title="`Edit ${member.firstname} ${member.lastname}'s information`" @save="submitMember()">
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

      <div class="col-12">
        <label for="keycloakId" class="form-label">Keycloak ID</label>
        <div class="input-group">
          <input
            type="text"
            id="keycloakId"
            class="form-control"
            :disabled="!displayKeycloakId"
            :value="displayKeycloakId 
              ? member.keycloakId 
              : '•'.repeat(member.keycloakId.length)"
          >
          <button
            type="button" 
            class="btn btn-outline-dark d-flex align-items-center" 
            @click="displayKeycloakId = !displayKeycloakId" 
          >
            <BiEye v-if="displayKeycloakId" aria-hidden="true"/>
            <BiEyeSlash v-else aria-hidden="true"/>
          </button>
          <button
            type="button"
            class="btn d-flex align-items-center"
            :class="keycloakIdCopied ? 'btn-outline-success' : 'btn-outline-secondary'"
            @click="copyKeycloakId(member.keycloakId)"
          >
            <BiCheckLg v-if="keycloakIdCopied"/>
            <BiCopy v-else />
          </button>
        </div>
      </div>

      <div class="col-2">
        <div 
          v-if="memberValues.profilePictureLink" 
          class="form-picture position-relative"
        >
          <img
            :src="memberValues.profilePictureLink"
            alt="Profile picture"
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
            <BiTrash aria-hidden="true" viewBox="0 0 16 16" height="8" width="8"/>
          </button>
          <button 
            type="button" 
            title="Upload new picture" 
            class="position-absolute start-50 btn btn-info rounded-circle 
            d-flex align-items-center justify-content-center" 
            style="font-size: 0px; padding: 1%; aspect-ratio: 1; top: 35%"
          >
            <BiUpload aria-hidden="true" viewBox="0 0 16 16" height="8" width="8"/>
          </button>
        </div>
        <button
          v-else
          class="member-profile form-picture d-inline-flex fs-6 
          align-items-center justify-content-center btn btn-sm btn-light"
          title="Upload profile picture"
        >
          <BiUpload aria-hidden="true" />
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

  <ModalInfo v-model:open="contactsModal" size="lg" :title="`${member.firstname} ${member.lastname}'s contact methods`">
    <div class="col">
      <table width="100%">
        <thead>
          <tr>
            <th class="p-1" style="text-align: center; width: 30%;" id="method">Method</th>
            <th class="p-1" style="text-align: center; width: 40%;" id="handle">Handle</th>
            <th class="p-1" style="text-align: center; width: 15%;" id="visibility">Visibility</th>
            <th class="p-1" style="text-align: center; width: 15%;" id="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in member.contacts" :key="contact.id">
            <td class="p-1">{{ contact.platform }}</td>
            <td class="p-1">{{ contact.link }}</td>
            <td class="p-1" style="text-align: center;">
              <BiUnlock class="m-auto" aria-label="Public"/>
            </td>
            <td class="p-1 d-flex justify-content-around">
              <button
                type="button"
                class="btn btn-sm d-flex align-items-center"
                :class="copiedContactId == contact.id ? 'btn-success' : 'btn-secondary'"
                aria-label="Copy to clipboard"
                @click="copyContact(contact)"
              >
                <BiCheckLg v-if="copiedContactId == contact.id" aria-hidden="true" />
                <BiCopy v-else aria-hidden="true" />
              </button>
              <button type="button" v-if="editable" class="btn btn-sm btn-warning d-flex align-items-center">
                <BiPencilSquare aria-hidden="true"/>
              </button>
              <button type="button" v-if="editable" class="btn btn-sm btn-danger d-flex align-items-center">
                <BiTrash aria-hidden="true"/>
              </button>
            </td>
          </tr>
          <tr v-if="editable">
            <th colspan="3">
              Private methods
            </th>
            <th style="text-align: center;">
              <button type="button" class="btn" @click="privateVisible = !privateVisible">
                <BiChevronDown v-if="privateVisible" aria-label="Hide private methods"/>
                <BiChevronUp v-else aria-label="Display private methods"/>
              </button>
            </th>
          </tr>
          <tr v-for="contact in privateVisible ? privateContacts : []" :key="contact.id">
            <td class="p-1">{{ contact.platform }}</td>
            <td class="p-1" >
              <div class="d-flex justify-content-between">
                <span class="text-truncate">{{ displayedContactId == contact.id ? contact.link : '•'.repeat(contact.link.length) }}</span>
                <button
                  v-if="displayedContactId == contact.id"
                  type="button"
                  class="btn btn-sm d-inline-flex align-items-center float-end"
                  :aria-label="'Hide the link for ' + contact.platform"
                  @click="displayedContactId = ''"
                >
                  <BiEyeSlash aria-hidden="true"/>
                </button>
                <button 
                  v-else
                  type="button" 
                  class="btn btn-sm d-inline-flex align-items-center float-end" 
                  :aria-label="'Display the link for ' + contact.platform"
                  @click="displayedContactId = contact.id"
                >
                  <BiEye aria-hidden="true"/>
                </button>
              </div>
            </td>
            <td class="p-1" style="text-align: center;">
              <BiLock class="m-auto" aria-label="Private"/>
            </td>
            <td class="p-1 d-flex justify-content-center">
              <button
                type="button"
                class="btn d-flex align-items-center"
                :class="copiedContactId == contact.id ? 'btn-success' : 'btn-secondary'"
                aria-label="Copy to clipboard"
                @click="copyContact(contact)"
              >
                <BiCheckLg v-if="copiedContactId == contact.id" aria-hidden="true" />
                <BiCopy v-else aria-hidden="true" />
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="editable">
          <tr>
            <td class="p-1">
              <input type="text" aria-labelledby="#method" class="form-control">
            </td>
            <td class="p-1">
              <input type="text" aria-labelledby="#handle" class="form-control">
            </td>
            <td class="p-1">
              <div class="d-flex justify-content-center">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  name="public" 
                  id="public" 
                  v-model="contactFormValues.public"
                >
                <label class="form-check-label ms-1" for="public">Public</label>
              </div>
            </td>
            <td class="p-1 d-flex justify-content-center">
              <button type="button" class="btn btn-success">Add</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </ModalInfo>

</template>

<script lang="ts">
import { type PropType, defineComponent } from 'vue';
import { MemberParticipations, type Contact, type Member } from '@/dto/Member';
import { type Team } from '@/dto/Team';
import ModalForm from './modals/ModalForm.vue';
import ModalInfo from './modals/ModalInfo.vue';
import ProfilePicture from './ProfilePicture.vue';
import BiChevronDown from 'bootstrap-icons/icons/chevron-down.svg?component';
import BiChevronUp from 'bootstrap-icons/icons/chevron-up.svg?component';
import BiXLg from 'bootstrap-icons/icons/x-lg.svg?component';
import BiPersonLinesFill from 'bootstrap-icons/icons/person-lines-fill.svg?component';
import BiPencilSquare from 'bootstrap-icons/icons/pencil-square.svg?component';
import BiTrash from 'bootstrap-icons/icons/trash.svg?component';
import BiUpload from 'bootstrap-icons/icons/upload.svg?component';
import BiCopy from 'bootstrap-icons/icons/copy.svg?component';
import BiCheckLg from 'bootstrap-icons/icons/check-lg.svg?component';
import BiUnlock from 'bootstrap-icons/icons/unlock.svg?component';
import BiLock from 'bootstrap-icons/icons/lock.svg?component';
import BiEye from 'bootstrap-icons/icons/eye.svg?component';
import BiEyeSlash from 'bootstrap-icons/icons/eye-slash.svg?component';
import axios, { type AxiosResponse } from 'axios';

interface ContactFormValues {
  method?: string
  handle?: string
  public: boolean
}

export default defineComponent({
  name: "EventMemberListItem",

  components: { 
    ModalForm,
    ModalInfo,
    ProfilePicture,
    BiXLg,
    BiChevronDown,
    BiChevronUp,
    BiPersonLinesFill,
    BiPencilSquare,
    BiTrash,
    BiUpload,
    BiCopy,
    BiCheckLg,
    BiUnlock,
    BiLock,
    BiEye,
    BiEyeSlash
  },

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
      displayKeycloakId: false,
      keycloakIdCopied: false,
      deleteModal: false,
      memberValues: { 
        lastname: this.member.lastname, 
        firstname: this.member.firstname, 
        profilePictureLink: this.member.profilePictureLink 
      },
      contactsModal: false,
      contactFormValues: { public: true } as ContactFormValues,
      copiedContactId: "",
      copyTimeoutId: undefined as undefined | number,
      privateVisible: false,
      privateContacts: [] as Array<Contact>,
      privateContactsLoading: false,
      privateContactsLoadedOnce: false,
      displayedContactId: ""
    }
  },

  mounted() {
    if (!this.short && this.eventId) {
      this.loadTeams((this.member.participations as MemberParticipations).getTeamIds(this.eventId))
    }
    this.privateContactsLoadedOnce = false
  },

  watch: {
    privateVisible() {
      if (this.editable && this.privateVisible && !this.privateContactsLoadedOnce) {
        this.privateContactsLoading = true
        axios.get(`/kalon/members/${this.member.id}/contact/private`).then((response: AxiosResponse<Array<Contact>>) => {
          this.privateContacts = response.data;
          this.privateContactsLoading = false;
          this.privateContactsLoadedOnce = true;
        })
      }
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

    async copy(value: string, resetFn: Function): Promise<void> {
      window.clearTimeout(this.copyTimeoutId)
      await navigator.clipboard.writeText(value);
      this.copyTimeoutId = window.setTimeout(resetFn, 1500);
    },

    copyKeycloakId(id: string) {
      this.copy(id, () => this.keycloakIdCopied = false)
        .then(() => this.keycloakIdCopied = true)
    },

    copyContact(contact: Contact) {
      this.copy(
        `${contact.platform}: ${contact.link}`, 
        () => this.copiedContactId = ""
      ).then(() => {
        this.copiedContactId = contact.id;
      })
    },

    submitContactMethod() {
      
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