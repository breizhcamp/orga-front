<template>
  <div class="d-flex flex-row justify-content-between">
    <h5>{{ team.name }} - {{ memberCount }} {{ 'member' + (memberCount > 1 ? 's' : '') }}</h5>
    <button v-if="editable" class="btn btn-sm btn-danger d-flex align-items-center" type="button">
      <BiTrash class="me-1" aria-hidden="true"/>
      Delete
    </button>
  </div>
  <div>
    {{ team.description || 'No description' }}
  </div>
</template>

<script lang="ts">
import { type PropType, defineComponent } from 'vue';
import { TeamParticipations, type Team } from '@/dto/Team';
import BiTrash from 'bootstrap-icons/icons/trash.svg?component';

export default defineComponent({
  name: "EventTeamListItem",
  components: { BiTrash },

  props: {
    team: { type: Object as PropType<Team>, required: true },
    eventId: { type: Number, required: true },
    editable: { type: Boolean, required: true }
  },

  data() {
    return {
      memberCount: (this.team.participations as TeamParticipations).getMemberIds(this.eventId).length
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