<template>
  <div class="badge ms-2 pe-3 text-bg-secondary d-inline-flex flex-row">
    <BiPerson class="main-icon"/>
    <component v-bind:is="getSubIcon()" class="sub-icon bg-secondary" overflow="visible"/>
    <div class="d-inline-flex flex-column justify-content-center identity">
      <span :class="expanded ? 'ms-3 text' : 'no-text'" class="text-start identity">
        {{ getRole() }}
        <br>
        {{ keycloak.idTokenParsed?.["preferred_username"] }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
/// <reference types="vite-svg-loader" />
import { defineComponent, inject, type Component } from "vue"
import type Keycloak from "keycloak-js"
import { keycloakKey } from "@/provide-keys"
import BiPerson from "bootstrap-icons/icons/person.svg?component"
import BiKey from "bootstrap-icons/icons/key.svg?component"
import BiTools from "bootstrap-icons/icons/tools.svg?component"
import BiPeople from "bootstrap-icons/icons/people.svg?component"

export default defineComponent({
  name: "IdentityBadge",
  components: {
    BiPerson
  },
  props: {
    expanded: { type: Boolean, required: true }
  },

  data() {
    return {
      keycloak: (inject(keycloakKey) as Keycloak),
    }
  },

  methods: {
    getSubIcon(): Component {      
      if (this.keycloak.hasRealmRole("admin")) {
        return BiKey
      }

      if (this.keycloak.hasRealmRole("orga")) {
        return BiTools
      }

      return BiPeople
    },

    getRole(): string {      
      if (this.keycloak.hasRealmRole("admin")) {
        return "Administrator"
      }

      if (this.keycloak.hasRealmRole("orga")) {
        return "Organiser"
      }

      return "Member"
    }
  }
})
</script>

<style scoped>
.main-icon {
  display: inline;
  text-align: start;
  margin-top: 15px;
  margin-bottom: 15px;
  margin-left: 15px;
  margin-right: -10px;
  transform: scale(2);
}

.sub-icon {
  transform: translate(30%, 150%);
  margin-right: 0;
}

.badge,
.identity {
  transition: all 0.3s;
}

.no-text {
  font-size: 0;
  transition: all 0.3s;
}

.text {
  transition: all 0.3s;
}

* {
  color: white;
}
</style>
