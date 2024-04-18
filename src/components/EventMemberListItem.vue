<template>
  <div>
    <img v-if="member.profilePictureLink" :src="member.profilePictureLink">
    <b>{{ member.firstname + ' ' + member.lastname }}</b><br>
    Membre de :
    <ul class="list">
      <li v-for="team in teams" :key="team.id">
        <div>
          <i>{{ team.name }}&nbsp;</i>
          <button type="button" class="btn btn-sm btn-danger" @click="removeTeam(team.id)">Retirer</button>
        </div>
      </li>
      <li v-if="eventTeams
            .filter(t => !teams.map(t => t.id)
              .includes(t.id)).length !== 0"
      >
        <div class="dropdown">
          <button 
            type="button" 
            class="btn btn-sm btn-success dropdown-toggle" 
            data-bs-toggle="dropdown"
            :class="teamDropdown ? 'show' : null"
            @click="teamDropdown = !teamDropdown"
          >
            Ajouter&nbsp;
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
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { type PropType, defineComponent } from 'vue';
import { MemberParticipations, type Member } from '@/dto/Member';
import { type Team } from '@/dto/Team';
import axios, { type AxiosResponse } from 'axios';


export default defineComponent({
  name: "EventMemberListItem",

  props: {
    member: { type: Object as PropType<Member>, required: true },
    eventId: { type: Number, required: true },
    eventTeams: { type: Object as PropType<Array<Team>>, required: true }
  },

  emits: ['reload'],

  data() {
    return {
      teams: [] as Team[],
      teamDropdown: false,
    }
  },

  mounted() {
    this.loadTeams((this.member.participations as MemberParticipations).getTeamIds(this.eventId))
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
    }
  }
})
</script>

<style>
ul.list > li > div {
  display: inline-table;
  vertical-align: middle;
}
</style>