<script setup lang="ts">
import Logo from '@/assets/breizhcamp-logo-2026.svg?component'
import { useEventStore } from '@/stores/event.ts';
import BiHouseDoor from "bootstrap-icons/icons/house-door.svg?component";
import BiBuilding from "bootstrap-icons/icons/building.svg?component";
import BiCalendarWeek from 'bootstrap-icons/icons/calendar-week.svg?component'

const eventStore = useEventStore();

</script>

<template>
<nav class="d-flex flex-column flex-shrink-0 p-3 bg-body">
  <a class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none link-body-emphasis" href="/">
    <Logo width="158" height="51"/>
  </a>
  <hr>
  <select class="form-select mb-3" v-model="eventStore.currentEventId" :disabled="eventStore.loading">
    <option v-for="e in eventStore.events" v-bind:key="e.id" :value="e.id">
      {{ e.name }}
    </option>
  </select>

  <ul class="nav nav-pills flex-column mb-auto">
    <li class="nav-item">
      <router-link to="/" class="nav-link" active-class="active" title="Home">
        <BiHouseDoor class="bi pe-none me-2"/> Home
      </router-link>
    </li>
    <!--li class="nav-item">
      //import BiTicket from 'bootstrap-icons/icons/ticket-perforated.svg?component'
      <router-link to="/bilhed" class="nav-link" active-class="active" title="Billetterie">
        <BiTicket class="bi pe-none me-2"/> Billetterie
      </router-link>
    </li-->
    <li class="nav-item">
      <router-link to="/moneiz" class="nav-link" active-class="active" title="Sponsoring">
        <BiBuilding class="bi pe-none me-2"/> Sponsoring
      </router-link>
    </li>
    <li class="nav-item">
      <router-link to="/sessions" class="nav-link" active-class="active" title="Sessions">
        <BiCalendarWeek class="bi pe-none me-2"/> Sessions
      </router-link>
    </li>
  </ul>

</nav>
</template>

<style scoped>
nav {
  width: 220px;
}

.nav-link {
  color: RGBA(var(--bs-emphasis-color-rgb))
}
</style>
