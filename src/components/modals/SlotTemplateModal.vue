<template>
  <ModalForm 
    v-model:open="modal" 
    :title="'Select a template for ' + 
      modalData.hall?.name + 
      ' on ' + 
      modalData.day?.date.format('dddd')
    "
    size="xl"
    @save="submitTemplate()"
  >
    <table style="width: 100%;" class="text-center">
      <colgroup>
        <col>
        <col v-for="template in templates" :key="template.name" class="template-col" :class="template.name == selectedTemplate?.name ? 'selected' : ''">
      </colgroup>
      <thead>
        <tr>
          <th style="width: 5%;"></th>
          <th :style="{ width: 95/templates.length + '%' }" class="border" v-for="template in templates" :key="template.name" @click="selectTemplate(template.name)">
            {{ template.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="hour in templateHours" :key="hour.time.unix()">
          <td v-if="Math.round(hour.time.minute() / 15) % 2 == 0" class="border">{{ hour.time.format("HH:mm") }}</td>
          <td v-else class="border">&nbsp;</td>
          <td v-for="template in templates.filter(t => hour.cells.get(t.name)!.display)" :key="template.name" class="border" :rowspan="hour.cells.get(template.name)!.span"
            :class="(hour.cells.get(template.name)?.pause ? 'pause' : 'session') + ' ' + (template.name === selectedTemplate?.name ? 'selected' : '')"
            @click="selectTemplate(template.name)"
          >
            {{ hour.cells.get(template.name)?.label }}
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="alert alert-warning alert-dismissible mt-3" role="alert" v-if="modalAlert">
      <div>No template selected</div>
      <button type="button" class="btn-close" aria-label="Close" @click="modalAlert = false"></button>
    </div>
  </ModalForm>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import ModalForm from './ModalForm.vue';
import type { Dayjs } from 'dayjs';
import type { Hall } from '@/dto/Hall';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import durationPlugin from 'dayjs/plugin/duration';
import __templates from "@/assets/templates.json";
import axios from 'axios';
import type { EventDTO } from '@/dto/EventDTO';
import type { SlotCreationReq } from '@/dto/Requests';

interface RawTemplate {
  name: string
  slots: Array<{ 
    start: string, 
    duration: string, 
    label: string,
    title: string
  }>
}

interface Template {
  name: string 
  slots: Map<Dayjs, { 
    span: number, 
    label: string,
    title: string 
  }>
  rawTemplate: RawTemplate
}

export default defineComponent({
  name: "SlotTemplateModal",

  components: { ModalForm },

  props: {
    open: { type: Boolean, required: true },
    event: { type: Object as PropType<EventDTO>, required: true },
    hall: { type: Object as PropType<Hall>, required: false },
    day: { type: Object as PropType<{ index: number, date: Dayjs }>, required: false },
  },

  emits: ['reload', 'close'],

  data() {
    return {
      modal: false,
      modalData: {} as { hall?: Hall, day?: { index: number, date: Dayjs }, title?: string },
      modalAlert: false,
      templates: [] as Template[],
      templateHours: [] as { time: Dayjs, cells: Map<string, { span: number, display: boolean, pause: boolean, label?: string }>}[],
      selectedTemplate: undefined as Template | undefined,
    }
  },

  watch: {
    open() {
      this.modal = this.open
    },

    modal() {
      if (this.modal) {
        this.openModal()
      } else {
        this.closeModal()
      }
    }
  },

  mounted() {
    this.loadTemplates()
  },

  methods: {
    loadTemplates() {
      dayjs.extend(durationPlugin)
      dayjs.extend(customParseFormat)
      this.templateHours = [];
      let minHour: Dayjs = dayjs().hour(23)
      let maxHour: Dayjs = dayjs().hour(0)

      this.templates = (__templates as RawTemplate[]).map(raw => {
        const slotMap: Map<Dayjs, { span: number, label: string, title: string }> = new Map();
        raw.slots.forEach(s => {
          const start = dayjs(s.start, "HH:mm");
          if (minHour == undefined || minHour.isAfter(start)) {
            minHour = start;
          }
        
          const duration = dayjs.duration(s.duration)
          if (maxHour == undefined || maxHour.isBefore(start.add(duration))) {
            maxHour = start.add(duration)
          }
        
          const key = start.minute(Math.floor(start.minute() / 15) * 15)
          const value = Math.ceil(duration.asMinutes() / 15)
        
          slotMap.set(key, { span: value, label: s.label, title: s.title })
        })
      
      
        return {
          name: raw.name,
          slots: slotMap,
          rawTemplate: raw
        } as Template
      })
    
      minHour = minHour.minute(Math.floor(minHour.minute() / 15) * 15)
      maxHour = maxHour.minute(Math.ceil(maxHour.minute() / 15) * 15)
    
      const rowsToConsume: Map<string, number> = new Map();
      let currentCells: Map<string, { span: number, display: boolean, pause: boolean, label?: string }> = new Map()
    
      do {
        this.templates.forEach(t => {
        
          const min = minHour
          const slot = Array.from(t.slots.entries())
            .find(s => s[0].isSame(min))?.[1];
        
          if (slot != undefined) {
            rowsToConsume.set(t.name, slot.span)
            currentCells.set(t.name, { span: slot.span, display: true, pause: false, label: slot.label });
          } else {
            const oldSpan = rowsToConsume.get(t.name) || 0;
            rowsToConsume.set(t.name, Math.max(0, oldSpan - 1))
            currentCells.set(t.name, { span: 1, display: rowsToConsume.get(t.name)! < 1, pause: true, label: undefined })
          }
        
        })
        this.templateHours.push({ time: minHour, cells: new Map(currentCells) })
      
        minHour = minHour.add(15, 'minutes')
      } while (minHour.isBefore(maxHour))
    },

    selectTemplate(name: string){
      this.selectedTemplate = this.templates.find(t => t.name === name);
    },

    submitTemplate() {
      if (
        this.modalData.day == undefined ||
        this.modalData.hall == undefined
      ) {
        // Should not be able to submit a template outside of a called template modal
        return;
      }

      let hall = this.modalData.hall;
      let day = this.modalData.day;
    
      if (this.selectedTemplate == undefined) {
        this.modalAlert = true;
        return;
      }
    
      this.modalAlert = false;
      const slots = this.selectedTemplate.rawTemplate.slots;
      const slotsCount = { total: slots.length, resolved: 0 };
    
      slots.forEach(slot => {
        const req: SlotCreationReq = {
          start: dayjs(slot.start, "HH:mm").format("HH:mm:ss"),
          day: day.index,
          duration: slot.duration,
          title: slot.title,
          hallIds: [ hall.id ],
          assignable: true
        };
      
        axios.post("/konter/slots/" + this.event.id, req).then(() => {
          slotsCount.resolved++;
        
          if (slotsCount.resolved === slotsCount.total) {
            this.$emit('reload');
            this.modal = false
          }
        })
      })
    },

    openModal() {
      this.modalData.hall = this.hall
      this.modalData.day = this.day
      this.selectedTemplate = undefined
    },

    closeModal() {
      this.modalData = {};
      this.$emit('close');
    },

  }
})
</script>

<style>
.pause {
  background-color: white;
}

.session {
  background-color: #7BD3EA;
}

.selected, .selected.pause {
  background-color: #F6F7C4;
}


.selected.session {
  background-color: #A1EEBD;
}
</style>
