<template>
  <h5>{{ team.name }}</h5>
  <div>
    {{ team.description || 'Pas de description' }}
  </div>
</template>

<script lang="ts">
import { type PropType, defineComponent } from 'vue';
import { type Team } from '@/dto/Team';

export default defineComponent({
  name: "EventTeamListItem",

  props: {
    team: { type: Object as PropType<Team>, required: true },
    eventId: { type: Number, required: true }
  },
})
</script>

<style>
ul.list > li > div {
  display: inline-table;
  vertical-align: middle;
}
</style>