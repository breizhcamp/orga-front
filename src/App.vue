<template>
  <div class="wrapper">
    <nav class="sidebar bg-dark">
      <div class="position-sticky">
        <div class="mx-1 mt-4">
          <div class="sidebar-header text-white">
            <div class="brand">
              <Logo width="30" height="30" aria-hidden="true"/>
              <h1 :class="expanded ? 'text fs-5' : 'no-text'">
                Organisation
              </h1>
            </div>
          </div>
        
          <ul class="nav flex-column">
            <li class="nav-item mb-3">
              <button 
                class="nav-link btn btn-dark rounded-pill expand" 
                @click="expanded = !expanded" 
                :class="expanded ? '' : 'protruding'" 
                :aria-label="expanded ? 'Collapse the navbar' : 'Expand the navbar'"
              >
                <component 
                  :is="expanded ? 'BiArrowLeft' : 'BiArrowRight'" 
                  class="nav-icon" 
                  aria-hidden="true" 
                />
                <span :class="expanded ? 'text' : 'no-text'">Collapse</span>
              </button>
            </li>
            <li class="nav-item">
              <router-link
                to="/registered" 
                class="nav-link"
                aria-label="Go to registered"
              >
                <BiPersonDown class="nav-icon" aria-hidden="true"/>
                <span :class="expanded ? 'text' : 'no-text'">Registered</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/participants"
                class="nav-link"
                aria-label="Go to participants"
              >
                <BiPersonCheck class="nav-icon" aria-hidden="true"/>
                <span :class="expanded ? 'text' : 'no-text'">Participants</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link 
                to="/attendees" 
                class="nav-link" 
                aria-label="Go to attendees"
              >
                <BiChatLeftText class="nav-icon" aria-hidden="true"/>
                <span :class="expanded ? 'text' : 'no-text'">Attendees</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link 
                to="/sessions" 
                class="nav-link" 
                aria-label="Go to sessions"
              >
                <BiCalendarWeek class="nav-icon" aria-hidden="true"/>
                <span :class="expanded ? 'text' : 'no-text'">Sessions</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link 
                to="/events" 
                class="nav-link"
                aria-label="Go to events"
              >
                <BiGear class="nav-icon" aria-hidden="true"/>
                <span :class="expanded ? 'text' : 'no-text'">Events</span>
              </router-link>
            </li>
            <li class="nav-item fixed-bottom d-flex flex-column" style="width: fit-content;">
              <IdentityBadge :expanded="expanded"/>
              <button role="button" type="button" class="btn nav-link" @click="logout">
                <BiBoxArrowLeft class="nav-icon" />
                <span :class="expanded ? 'text' : 'no-text'">Logout</span>
              </button>
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
import { defineComponent, inject } from 'vue'
import IdentityBadge from "@/components/IdentityBadge.vue";
import Logo from '@/assets/logo-breizhcamp-icone.svg?component'
import BiPersonDown from 'bootstrap-icons/icons/person-down.svg?component'
import BiPersonCheck from 'bootstrap-icons/icons/person-check.svg?component'
import BiChatLeftText from "bootstrap-icons/icons/chat-left-text.svg?component";
import BiCalendarWeek from 'bootstrap-icons/icons/calendar-week.svg?component'
import BiGear from 'bootstrap-icons/icons/gear.svg?component'
import BiArrowLeft from "bootstrap-icons/icons/arrow-left-short.svg?component";
import BiArrowRight from "bootstrap-icons/icons/arrow-right-short.svg?component";
import BiBoxArrowLeft from "bootstrap-icons/icons/box-arrow-left.svg?component";
import type Keycloak from "keycloak-js"
import { keycloakKey } from './provide-keys';

export default defineComponent({
  name: "AppView",
  components: { 
    IdentityBadge,
    Logo, 
    BiPersonDown, 
    BiPersonCheck, 
    BiChatLeftText, 
    BiCalendarWeek, 
    BiGear, 
    BiArrowLeft, 
    BiArrowRight,
    BiBoxArrowLeft
  },

  data() {
    return {
      expanded: false
    }
  },
  methods: {
    logout() {
      this.$.appContext.app.runWithContext(() => 
        (inject(keycloakKey) as Keycloak).logout()
      );
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
}

.brand {
  display: inline-flex;
  align-items: center;
  width: max-content;
  margin-left: 5px;
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
}

.nav-link:focus-visible {
  all: unset;
  width: max-content;
  padding: 15px;
  font-size: 1.1em;
  display: inline-flex;
  align-items: center;
  color: #fff;
  border: 4px dashed orangered;
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
  margin-left: 10px;
  transition: all 0.3s;
}

.protruding,
.protruding:focus {
  transform: translateX(80%);
  padding: 5px;
}

.protruding:hover,
.protruding:focus-visible {
  transform: translateX(100%);
  padding: 5px;
}

.protruding:focus-visible {
  border: 3px dashed orangered;
  box-shadow: none;
  background-color: var(--bs-btn-bg);
}

.btn-dark {
  padding-top: 5px;
  padding-bottom: 5px;
} 

.nav-link.expand {
  padding-top: 5px;
  padding-bottom: 5px;
}
</style>
