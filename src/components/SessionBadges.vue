<template>
  <div class="row">
    <div class="col float-end">
      <span 
        v-for="[title, info] in infos.entries()"
        :key="info.label"
        class="badge rounded-pill ms-1" 
        :class="'text-bg-' + info.color"
      >
        <span class="visually-hidden">{{ title }}</span>
        {{ info.label }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import type { Session } from '@/dto/Session';
import { defineComponent, type PropType } from 'vue';
import * as sessionEnums from '@/dto/SessionEnums';
import type { BadgeInfos } from '@/dto/BadgeInfos';

export default defineComponent({
  name: "SessionBadges",

  props: {
    session: { type: Object as PropType<Session>, required: true }
  },

  data() {
    return { 
      infos: new Map<string, BadgeInfos>([
        [ "format", sessionEnums.formatToBadgeInfos(this.session.format)], 
        [ "theme", sessionEnums.themeToBadgeInfos(this.session.theme)], 
        [ "niveau", sessionEnums.niveauToBadgeInfos(this.session.niveau)], 
        [ "status", sessionEnums.statusToBadgeInfos(this.session.status)], 
      ])
    }
  }
})
</script>