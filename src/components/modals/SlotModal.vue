<template>
  <ModalForm 
    v-model:open="modal" 
    :title="'Add slot on ' + modalData.day?.date.format('dddd')" 
    @save="submitSlot()"
  >
    <div class="row row-cols-2 gy-3">
      <div class="col">
        <label for="day" class="form-label">Day<b style="color: red">*</b></label>
        <input type="text" class="form-control" id="day" :value="modalData.day?.date.format('dddd')" disabled>
      </div>

      <div class="col">
        <label for="start" class="form-label">Start<b style="color: red">*</b></label>
        <input 
          type="time" 
          class="form-control" 
          id="start" 
          :value="modalValues.time" 
          :disabled="modalData.time != undefined" 
          @change="modalValues.time = ($event.target as HTMLSelectElement).value"
        >
      </div>

      <div class="col">
        <label for="format" class="form-label">Format<b style="color: red">*</b></label>
        <select 
          id="format" 
          class="form-control" 
          @change="selectSlotFormat($event)"
        >
          <option :value="UNDEFINED_FORMAT"></option>
          <option 
            v-for="format in (
              Object.values(SessionFormatEnum)
                .filter(f => typeof f === typeof SessionFormatEnum.CONFERENCE) as SessionFormatEnum[]
              ).filter(f => formatToMinutes(f) != undefined)" 
            :key="format" 
            :value="formatToMinutes(format)"
          >
            {{ 
              formatToBadgeInfos(format).label 
            }} - {{ 
              beautifyDuration(`PT${formatToMinutes(format)}M`) 
            }}
          </option>
          <option :value="CUSTOM">Keynote</option>
          <option :value="CUSTOM">Other</option>
        </select>
      </div>

      <div class="col">
        <label class="form-label" for="duration">Duration (minutes)<b style="color: red">*</b></label>
        <input class="form-control" id="duration" type="number" :value="modalValues.duration" :disabled="!modalValues.customDuration"
        @change="(e) => { modalValues.duration = Number((e.target as HTMLInputElement).value) }">
      </div>

      <div class="col-12">
        <label for="tracks" class="form-label">Tracks</label>
        <ul class="list-group" id="tracks">
          <li class="list-group-item" v-for="h in availableHalls" :key="h.id">
            <input 
              class="form-check-input me-1" 
              type="checkbox" 
              :id="'checkbox_' + h.id"
              :checked="selectedHalls.includes(h.id)" 
              @change="toggleHall(h.id)"
            >
            <label
              class="form-check-label stretched-link" 
              :for="'checkbox_' + h.id"
            >{{ h.name }} (Track {{ h.trackId }})</label>
          </li>
        </ul>
      </div>
    </div>

    <div class="alert alert-warning alert-dismissible mt-3" role="alert" v-if="modalAlert.display">
      <div>The following fields are missing : 
        <ul>
          <li v-for="field in modalAlert.fields" :key="field">{{ field }}</li>
        </ul>
      </div>
      <button type="button" class="btn-close" aria-label="Close" @click="modalAlert.display = false"></button>
    </div>

    <div class="alert alert-warning alert-dismissible mt-3" role="alert" v-if="modalConflictAlert.display">
      <div>
        This slot creates a time conflict with an existing slot<br>
        <code>{{ modalConflictAlert.content }}</code><br>
        <i v-if="modalData.time === undefined">
          Hint: check if the beginning of the slot is not later than you thought, or if the duration does not overlap with the following one
        </i>
        <i v-else>
          Hint: check if the duration does not overlap with the following one
        </i>
      </div>
      <button type="button" class="btn-close" aria-label="Close" @click="modalConflictAlert.display = false"></button>
    </div>
  </ModalForm>
</template>

<script lang="ts">
import type { EventDTO } from '@/dto/EventDTO';
import type { Hall } from '@/dto/Hall';
import { SessionFormatEnum, formatToBadgeInfos, formatToMinutes } from '@/dto/SessionFormatEnum';
import axios, { type AxiosResponse } from 'axios';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { defineComponent, type PropType } from 'vue';
import relativeTime from 'dayjs/plugin/relativeTime'
import durationPlugin from 'dayjs/plugin/duration';
import ModalForm from './ModalForm.vue';
import type { Slot } from '@/dto/Slot';

const CUSTOM: number = -1;
const UNDEFINED_FORMAT: number = -2;

interface SlotFormValues {
  customDuration: boolean
  duration?: number
  time?: string
  span?: number
}

interface SlotCreationReq {
  start: string
  day: number
  duration: string
  span?: number
}

interface MultiFieldAlert {
  display: boolean
  fields: Array<string>
}

interface MonoFieldAlert {
  display: boolean
  content: string
}

export default defineComponent({
  name: "SlotModal",

  components: { ModalForm },

  props: {
    event: { type: Object as PropType<EventDTO>, required: true },
    open: { type: Boolean, required: true },
    halls: { type: Object as PropType<Array<Hall>>, required: true },
    availableHalls: { type: Object as PropType<Array<Hall>>, required: true },
    day: { type: Object as PropType<{ index: number, date: Dayjs }>, required: false },
    time: { type: Object as PropType<Dayjs>, required: false },
    span: { type: Number, required: false },
  },

  emits: ['close', 'reload'],

  data() {
    return {
      modal: this.open,
      modalAlert: { display: false, fields: [] } as MultiFieldAlert,
      modalData: {} as { hall?: Hall, day?: { index: number, date: Dayjs }, time?: Dayjs },
      modalValues: { customDuration: false } as SlotFormValues,
      modalConflictAlert: { display: false, content: "" } as MonoFieldAlert,
      selectedHalls: this.halls.map(h => h.id),
      SessionFormatEnum,
      CUSTOM, UNDEFINED_FORMAT
    }
  },

  watch: {
    open() {
      if (this.open) {
        this.modalValues.time = this.time?.format("HH:mm");
        this.modalValues.duration = undefined;
        this.modalValues.span = this.span?.valueOf()
        this.modalData.day = this.day
        this.modalData.hall = this.halls[0]
        this.modalData.time = this.time
        this.selectedHalls = this.halls.map(h => h.id);

        this.modal = true
      }
    },

    modal() {
      if (!this.modal) {
        this.$emit('close')
      }
    },

    halls() {
      this.selectedHalls = this.halls.map(h => h.id)
    },
  },

  methods: {
    submitSlot() {
      // Validation

      let missingFields = false;
      let labels: string[] = [];
      
      if (this.modalValues.time == undefined) {
        missingFields = true;
        labels.push("Time");
      }

      if (!this.modalValues.customDuration && this.modalValues.duration == undefined) {
        missingFields = true;
        labels.push("Format");
      }

      if (this.modalValues.duration == undefined) {
        missingFields = true;
        labels.push("Duration");
      }

      this.modalAlert = {
        display: missingFields,
        fields: labels
      };

      if (missingFields) {
        return;
      }

      // Update 

      const req: SlotCreationReq = {
        start: this.modalValues.time!,
        day: this.modalData.day!.index,
        duration: `PT${this.modalValues.duration!}M`,
        span: this.modalValues.span
      }

      this.modalConflictAlert.display = false;

      if (this.selectedHalls.length < 1) {
        this.closeSlotModal()
        return
      }

      const hallsToAdd = Array.from(this.selectedHalls)
      const firstHall = hallsToAdd.pop()
      axios.post(`/konter/slots/${this.event.id}/${firstHall}`, req).then(
        (response: AxiosResponse<Slot>) => {
          if (response.status < 400) {
            const slotId = response.data.id
            Promise.all(hallsToAdd.map(h => this.assignHalltoSlot(h, slotId)))
            .then(() => {
              this.$emit('reload');
              this.closeSlotModal();
            })
          }
        }
      )
    },

    assignHalltoSlot(hallId: number, slotId: string): Promise<AxiosResponse<any, any>> {
      return axios.post(`/konter/slots/hall/${slotId}/${this.event.id}/${hallId}`)
    },

    selectSlotFormat(event: Event) {
      const target = event.target as HTMLInputElement;
    
      switch (Number(target.value)) {
        case UNDEFINED_FORMAT:
          this.modalValues.customDuration = false;
          this.modalValues.duration = undefined;
          break;

        case CUSTOM:
          this.modalValues.customDuration = true;
          this.modalValues.duration = undefined;
          break;
      
        default:
          this.modalValues.customDuration = false;
          this.modalValues.duration = Number(target.value);
          break;
      }
    
    },

    closeSlotModal() {
      this.modalConflictAlert.content = ""
      this.modalConflictAlert.display = false
    
      this.modalAlert.fields = []
      this.modalAlert.display = false
    
      this.modal = false
    },
    
    beautifyDuration(duration: string): string {
      dayjs.extend(durationPlugin)
      dayjs.extend(relativeTime)

      const dayJsDuration = dayjs.duration(duration)
      return dayJsDuration.locale('en').humanize()
    },

    toggleHall(id: number){
      if (this.selectedHalls.includes(id)) {
        this.selectedHalls = this.selectedHalls.filter(i => i != id);
      } else {
        this.selectedHalls.push(id)
      }
    },

    formatToMinutes,
    formatToBadgeInfos
  }
})
</script>
