<template>
  <div class="row">
    <div class="col float-end">
      <span 
        v-for="info in infos"
        :key="info.label"
        class="badge rounded-pill ms-1" 
        :class="'text-bg-' + info.color"
      >
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
      infos: [
        sessionEnums.formatToBadgeInfos(this.session.format),
        sessionEnums.themeToBadgeInfos(this.session.theme),
        sessionEnums.niveauToBadgeInfos(this.session.niveau),
        sessionEnums.statusToBadgeInfos(this.session.status),
      ] as BadgeInfos[]
    }
  }
})
</script>