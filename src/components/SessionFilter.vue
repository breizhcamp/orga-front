<template>
  <form class="row row-cols-lg-auto g-3 align-items-center mt-2 mb-3" @submit.prevent="search()">
    <div class="col-12">
      <label for="id" class="form-label">Id</label>
      <input type="number" id="id" class="form-control" :value="f.id" @input="event => f.id = getValue(event)">
    </div>
    <div class="col-12">
      <label for="title" class="form-label">Title</label>
      <input type="text" id="title" class="form-control" :value="f.title" @input="event => f.title = getValue(event)">
    </div>
    <div class="col-12">
      <label for="speaker-name" class="form-label">Speaker</label>
      <input type="text" id="speaker-name" class="form-control" :value="f.speakerName" @input="event => f.speakerName = getValue(event)">
    </div>
    <div class="col-12">
      <label for="format" class="form-label">Format</label>
      <select id="format" class="form-select" v-model="f.format">
        <option :value="undefined"></option>
        <option v-for="format in formatEnum.filter((val) => Number.isNaN(Number(val)))" :key="format" :value="format">
          {{ formatToColor(SessionFormatEnum[format as keyof typeof SessionFormatEnum]).label }}
        </option>
      </select>
    </div>
    <div class="col-12">
      <label for="theme" class="form-label">Theme</label>
      <select id="theme" class="form-select" v-model="f.theme">
        <option :value="undefined"></option>
        <option v-for="theme in themeEnum.filter((val) => Number.isNaN(Number(val)))" :key="theme" :value="theme">
          {{ themeToBadgeInfos(SessionThemeEnum[theme as keyof typeof SessionThemeEnum]).label }}
        </option>
      </select>
    </div>
    <div class="col-12">
      <label for="niveau" class="form-label">Level</label>
      <select id="niveau" class="form-select" v-model="f.niveau">
        <option :value="undefined"></option>
        <option v-for="niveau in niveauEnum.filter((val) => Number.isNaN(Number(val)))" :key="niveau" :value="niveau">
          {{ niveauToBadgeInfos(SessionNiveauEnum[niveau as keyof typeof SessionNiveauEnum]).label }}
        </option>
      </select>
    </div>
    <div class="col-12">
      <label for="status" class="form-label">Status</label>
      <select id="status" class="form-select" v-model="f.status">
        <option :value="undefined"></option>
        <option v-for="status in statusEnum.filter((val) => Number.isNaN(Number(val)))" :key="status" :value="status">
          {{ statusToBadgeInfos(SessionStatusEnum[status as keyof typeof SessionStatusEnum]).label }}
        </option>
      </select>
    </div>
    <div class="col-12">
      <label for="rated" class="form-label">Evaluated</label>
      <select id="rated" class="form-select" v-model="f.rated">
        <option :value="undefined"></option>
        <option :value="true">Yes</option>
        <option :value="false">No</option>
      </select>
    </div>
    <div class="col-12 no-label">
      <button
        type="submit"
        id="session-filter-search-button"
        class="btn btn-primary"
        @keydown.down.prevent="focusFirstSession()"
      >Search</button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { 
  SessionFormatEnum, 
  SessionNiveauEnum, 
  SessionStatusEnum, 
  SessionThemeEnum, 
  formatToBadgeInfos, 
  themeToBadgeInfos, 
  niveauToBadgeInfos, 
  statusToBadgeInfos
} from "@/dto/SessionEnums";
import type { SessionFilter } from '@/dto/SessionFilter';

export default defineComponent({
  name: 'SessionFilter',

  props: {
    filter: { type: Object as PropType<SessionFilter>, required: true },
  },

  emits: ['filter'],

  data() {
    return {
      f: { ...this.filter },
      SessionFormatEnum,
      SessionNiveauEnum,
      SessionStatusEnum,
      SessionThemeEnum,
      formatEnum: Object.keys(SessionFormatEnum),
      niveauEnum: Object.keys(SessionNiveauEnum),
      statusEnum: Object.keys(SessionStatusEnum),
      themeEnum: Object.keys(SessionThemeEnum),
    }
  },

  methods: {
    search() {
      this.$emit('filter', this.f);
    },

    getValue(event: Event) {
      return (event.target as HTMLInputElement)?.value || undefined;
    },

    focusFirstSession() {
      if (document.activeElement != null) {
        (document.activeElement as HTMLElement).blur();
      }
      (document.getElementById('infinite-scroll')?.firstElementChild as HTMLElement | null)?.focus();
    },

    formatToColor: formatToBadgeInfos,
    themeToBadgeInfos,
    niveauToBadgeInfos,
    statusToBadgeInfos,
  }
})
</script>
