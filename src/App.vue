<template>
  <div class="wrapper">
    <nav class="sidebar bg-dark">
      <div class="position-sticky">
        <div class="mx-1 mt-4">
          <div class="sidebar-header text-white">
            <h5 class="brand">
              <Logo width="30" height="30"/>
              <span :class="expanded ? 'text' : 'no-text'">
                Organisation
              </span>
            </h5>
          </div>
        
          <ul class="nav flex-column">
            <li class="nav-item">
              <a 
                class="nav-link btn btn-dark rounded-pill" 
                v-on:click="expanded = !expanded" 
                :class="expanded ? '' : 'protruding'" 
                aria-label="Plier/déplier la barre de navigation"
              >
                <component 
                  :is="expanded ? 'BiArrowLeft' : 'BiArrowRight'" 
                  class="nav-icon" 
                />
                <span :class="expanded ? 'text' : 'no-text'">Collapse</span>
              </a>
            </li>
            <hr class="small-hr"/>
            <li class="nav-item">
              <router-link to="/registered" class="nav-link">
                <BiPersonDown class="nav-icon" :class="expanded ? '' : 'big'" />
                <span :class="expanded ? 'text' : 'no-text'">Registered</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/participants" class="nav-link">
                <BiPersonCheck class="nav-icon" :class="expanded ? '' : 'big'" />
                <span :class="expanded ? 'text' : 'no-text'">Participants</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/attendees" class="nav-link">
                <BiChatLeftText class="nav-icon" :class="expanded ? '' : 'big'" />
                <span :class="expanded ? 'text' : 'no-text'">Attendees</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/sessions" class="nav-link">
                <BiCalendarWeek class="nav-icon" :class="expanded ? '' : 'big'" />
                <span :class="expanded ? 'text' : 'no-text'">Sessions</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/events" class="nav-link">
                <BiGear class="nav-icon" />
                <span :class="expanded ? 'text' : 'no-text'">Events</span>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div class="content">
      <RouterView />
    </div>
  </div>
  
</template>

<script lang="ts">
/// <reference types="vite-svg-loader" />
import { defineComponent } from 'vue'
import Logo from '@/assets/logo-breizhcamp-icone.svg?component'
import BiPersonDown from 'bootstrap-icons/icons/person-down.svg?component'
import BiPersonCheck from 'bootstrap-icons/icons/person-check.svg?component'
import BiChatLeftText from "bootstrap-icons/icons/chat-left-text.svg?component";
import BiCalendarWeek from 'bootstrap-icons/icons/calendar-week.svg?component'
import BiGear from 'bootstrap-icons/icons/gear.svg?component'
import BiArrowLeft from "bootstrap-icons/icons/arrow-left-short.svg?component";
import BiArrowRight from "bootstrap-icons/icons/arrow-right-short.svg?component";

export default defineComponent({
  name: "AppView",
  components: { 
    Logo, 
    BiPersonDown, 
    BiPersonCheck, 
    BiChatLeftText, 
    BiCalendarWeek, 
    BiGear, 
    BiArrowLeft, 
    BiArrowRight 
  },
  data() {
    return {
      expanded: false
    }
  }
})
</script>

<style scoped>
/* Sidebar */
.sidebar {
  position: sticky;
  top: 0;
  bottom: 0;
  box-shadow: 0 2px 5px 0 rgb(0 0 0 / 5%), 0 2px 10px 0 rgb(0 0 0 / 5%);
  z-index: 600;
  width: auto;
  display: block;
  transition: all 0.3s;
}

.brand {
  display: inline-flex;
  align-items: center;
  width: max-content;
  margin-left: 5px;
  transition: all 0.3s;
}

.wrapper {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: stretch;
  transition: all 0.3s;
}

.sidebar-header {
  padding: 15px;
  transition: all 0.3s;
}

.nav-item {
  margin-right: auto;
  align-items: left;
  display: inline-block;
  transition: all 0.3s;
}

.nav-link,
.nav-link:focus {
  width: max-content;
  padding: 15px;
  font-size: 1.1em;
  display: inline-flex;
  align-items: center;
  color: #fff;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #FFFFFFBF;
}

.content {
  width: 100%;
  min-height: 100vh;
  transition: all 0.3s;
}

.nav-icon {
  display: inline;
  margin: 10px;
  transition: all 0.3s;
  transform: scale(2);
}

.no-text {
  font-size: 0;
  transition: all 0.3s;
}

.text {
  margin-left: 5px;
  transition: all 0.3s;
}

.small-hr {
  margin: 0.5rem 0;
}

.protruding {
  transform: translateX(80%);
  padding: 5px;
}

.protruding:hover {
  transform: translateX(100%);
}

.btn-dark {
  padding-top: 5px;
  padding-bottom: 5px;
}

.btn-dark:hover {
  --bs-btn-hover-bg: var(--bs-btn-bg);
  --bs-btn-hover-border-color: var(--bs-btn-border-color);
}
</style>
