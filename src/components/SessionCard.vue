<template>
  <div class="card d-flex m-1 bg-secondary bg-opacity-25" @click="sessionModal = true">
    <div class="card-body bg-opacity-75">
      <div class="row">
        <div class="col-9 align-self-start">
          <div class="row">
            <div class="align-self-center w-4">
              <!-- 
                SVG object representing the evaluation gauge 

                Whole object is rotated by -90 degrees so that the 
                foreground circle arc starts at 0 o'clock
              -->
              <svg class="col" :width="size" :height="size" :view-box="`0 0 ${size} ${size}`"  style="transform: rotate(-90deg)">
                <!-- Background gray circle -->
                <circle 
                  :r="size * 0.4" 
                  :cx="size * 0.5" 
                  :cy="size * 0.5" 
                  fill="transparent" 
                  stroke="#eaeaea" 
                  :stroke-width="`${size / 10}px`"
                />
                <!-- Foreground circle arc, with length computed from rating between 0 and 5 -->
                <circle 
                  :r="size * 0.4" 
                  :cx="size * 0.5" 
                  :cy="size * 0.5" 
                  fill="transparent" 
                  :stroke="colorFromRating(session.rating)" 
                  :stroke-width="`${size / 10}px`"
                  :stroke-dasharray="2 * Math.PI * size * 0.4"
                  :stroke-dashoffset="2 * Math.PI * size * 0.4 * (session.rating ? (5 - session.rating) / 5 : 0)"
                  stroke-linecap="round"
                />
                <!-- 
                  Displayed evaluation
                  If rating is null, the displayed text is N/A

                  Text is rotated by 90 degrees because the whole object is rotated by -90 degrees
                -->
                <text 
                  :font-size="size / 3.5" 
                  x="50%" 
                  y="-48%" 
                  font-weight="bold" 
                  dominant-baseline="middle" 
                  text-anchor="middle" 
                  transform="rotate(90)"
                >{{ session.rating ? Math.round(session.rating * 10) / 10 : "N/A" }}</text>
              </svg>
            </div>
            <div class="align-self-center col">
              <div class="col">
                <div class="session-title fs-5 text-truncate"><b>{{ session.title }}</b></div>
                <div class="text-secondary fs-7">
                  <i>
                    {{ session.speakers.map((speaker: Speaker) => 
                      speaker.firstname + ' ' + speaker.lastname
                    ).join(', ') }}
                  </i>
                </div>
              </div>
            </div>
          </div>
          <SessionBadges :session="session"/>
        </div>
        <div class="col-2 d-flex flex-column justify-content-center">
          <BiPersoVideo3 class="opacity-50 mx-auto" width="24" height="24" viewBox="0 0 16 16"/>
          <div v-if="session.slot != undefined" class="d-inline-block mx-auto">Hall : <b>{{ session.slot.hall?.name }}</b></div>
          <div v-if="session.slot != undefined" class="d-inline-block mx-auto">On <b>{{ getDayName(eventStart, session.slot.day) }}</b> at <b>{{ beautifyTime(session.slot.start) }}</b></div>
          <i v-else class="d-inline-block mx-auto">No slot assigned</i>
        </div>
        <div class="col-1 d-flex align-items-center">
          <button
            type="button"
            class="btn btn-warning btn-outline-dark rounded-pill d-flex align-items-center"
            @click="(e) => {
              // Stopping propagation to prevent the sessionModal from opening
              e.stopPropagation();
              slotModal = true;
            }"
          >
            Edit <BiPencilSquare class="ms-1" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <ModalInfo v-model:open="sessionModal" :title="session.title">
    <SessionBadges :session="session" />
    <hr>
    <h5>Speakers</h5>
    <div class="d-flex mb-3">
      <div 
        v-for="speaker in session.speakers" 
        :key="speaker.id" 
        class="rounded-pill badge me-1 d-flex align-items-center"
        :class="session.owner.id == speaker.id ? 'text-bg-success' : 'text-bg-secondary'"
      >
        <img v-if="speaker.profilePicture" :src="speaker.profilePicture" class="rounded-pill" width="30">
        <span class="mx-1">{{ speaker.firstname[0] + '. ' + speaker.lastname }}</span>
      </div>
    </div>

    <div id="description">
      <hr>
      <h5>Description</h5>
      <p style="white-space: pre-wrap;">{{ session.description }}</p>
    </div>

    <div id="owner-notes" v-if="session.ownerNotes.trim().length > 0">
      <hr>
      <h5>Owner Notes</h5>
      <p style="white-space: pre-wrap;">{{ session.ownerNotes }}</p>
    </div>
  </ModalInfo>
  
  <ModalForm v-model:open="slotModal" :title="'Slot selection for session : ' + session.title" @save="saveSlotModal()">
    <div class="mb-3">
      <b>Session infos : </b>
      <SessionBadges :session="session"/>
    </div>

    <div class="alert alert-warning alert-dismissible" role="alert" v-if="slotAlert">
      <div>Either the three fields marked with a <b style="color: red;">*</b> or the barcode should be filled</div>
      <button type="button" class="btn-close" aria-label="Close" @click="slotAlert = false" ></button>
    </div>

    <div v-if="slots != undefined" class="row mb-3">
      <div class="col-4">
        <label for="day" class="form-label">Day <b style="color: red;">*</b></label>
        <select id="day" class="form-control" v-model="formValues.day">
          <option :value="undefined"></option>
          <option v-for="day in slots.entries()" :key="day[0]" :value="day[0]">Day {{ day[0] }}</option>
        </select>
      </div>

      <div class="col-4">
        <label for="hall" class="form-label">Hall <b style="color: red;">*</b></label>
        <select id="hall" class="form-control" :disabled="formValues.day == undefined" v-model="formValues.hall">
          <option :value="undefined"></option>
          <option v-for="hall in slots.get(formValues.day!)?.entries()" :key="hall[0].id" :value="hall[0]">{{ hall[0].name }} (Track {{ hall[0].trackId }})</option>
        </select>
      </div>

      <div class="col-4">
        <label for="slot" class="form-label">Slot <b style="color: red;">*</b></label>
        <select id="slot" class="form-control" :disabled="formValues.day == undefined || formValues.hall == undefined" v-model="formValues.slot">
          <option :value="undefined"></option>
          <option v-for="slot in slots.get(formValues.day!)?.get(formValues.hall!)" :key="slot.id" :value="slot">
            {{ slot.start }} {{ slot.duration }}
          </option>
        </select>
      </div>
    </div>
    <div class="mb-3">
      <label for="barcode" class="form-label">Barcode scan</label>
      <input type="text" id="barcode" class="form-control" :value="formValues.barcode" @input="e => formValues.barcode = getValue(e)">
    </div>
  </ModalForm>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Session } from '@/dto/Session';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Speaker } from '@/dto/Speaker';
import * as sessionEnums from '@/dto/SessionEnums';
import ModalInfo from "@/components/ModalInfo.vue";
import ModalForm from "@/components/ModalForm.vue";
import SessionBadges from '@/components/SessionBadges.vue';
import BiPersoVideo3 from 'bootstrap-icons/icons/person-video3.svg?component';
import BiPencilSquare from 'bootstrap-icons/icons/pencil-square.svg?component';
import type { Hall } from '@/dto/Hall';
import type { Slot } from '@/dto/Slot';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'

interface SlotFormValues {
  day?: number
  hall?: Hall
  slot?: Slot
  barcode?: string
}

export default defineComponent({
  name: "SessionCard",

  components: { ModalInfo, ModalForm, SessionBadges, BiPersoVideo3, BiPencilSquare },

  props: {
    session: { type: Object as PropType<Session>, required: true },
    availableHalls: { type: Array<Hall>, required: true },
    slots: { type: Object as PropType<Map<number, Map<Hall, Array<Slot>>> | null | undefined>, required: true }, 
    eventStart: { type: Date, required: false },
    forceModal: { type: Boolean, required: true },
  },

  emits: [
    'reload'
  ],

  data() {
    return {
      sessionEnums,
      loading: false,
      sessionModal: false,
      slotModal: this.forceModal,
      slotAlert: false,
      slotModalBarCodeFieldAutofocus: this.forceModal,
      size: 60,
      mounted: false,
      formValues: {
        day: this.session.slot?.day,
        hall: this.session.slot?.hall,
        slot: this.session.slot,
        barcode: this.session.slot?.barcode,
      } as SlotFormValues
    };
  },

  mounted() {
    this.mounted = true;
  },

  watch: {
    mounted() {
      this.initModal();
    },

    forceModal() {
      this.initModal();
    }
  },

  methods: {

    colorFromRating(rating?: number | null): string {
      if (rating == null) {
        // The session is not rated, the evalutation gauge appears empty
        return '#eaeaea';
      } else {
        /**
         * Colors for the evaluation gauge, in RGB
         * [0] -> RED (corresponds to a 0 out of 5)
         * [1] -> YELLOW (corresponds to a 2.5 out of 5)
         * [2] -> GREEN (corresponds to a 5 out of 5)
         */
        const gradient = [
          [255, 0, 0],
          [255, 255, 0],
          [0, 255, 0]
        ];

        /**
         * Compute first and second colors; and the ratio of each one
         * evaluation < 2.5 -> first: RED, second: YELLOW
         * evaluation >= 2.5 -> first: YELLOW, second: GREEN
         */
        let first: number[], second: number[], ratio: number;
        if (rating < 2.5) {
          [first, second] = gradient.slice(0, 2);
          ratio = rating / 2.5;
        } else {
          [first, second] = gradient.slice(1);
          ratio = (rating - 2.5) / 2.5;
        }

        // Interpolate the red, green and blue values from the two colors and the ratio
        return `rgb(${[
            Math.round(first[0] * (1 - ratio) + second[0] * ratio),
            Math.round(first[1] * (1 - ratio) + second[1] * ratio),
            Math.round(first[2] * (1 - ratio) + second[2] * ratio),
          ].join(', ')})`;
      }
    },

    initModal() {
      if(this.mounted) {
        this.slotModal = this.forceModal;
        this.slotModalBarCodeFieldAutofocus = this.forceModal;
        try {
          if (this.forceModal) {
            (document.activeElement as HTMLInputElement).blur();
          }
        } catch (error) {
          console.trace("No active element to blur");
        }
        setTimeout(() => {
          if (this.forceModal && document.getElementById('barcode') != null) {
            (document.getElementById('barcode') as HTMLInputElement).focus();
          }
        }, 100)
      }
    },

    getValue(e: Event) {
      return (e.target as HTMLInputElement).value
    },  

    closeSlotMOdal() {
      this.formValues = {};
    },

    saveSlotModal() {
      if ((
        this.formValues.day == undefined ||
        this.formValues.hall == undefined ||
        this.formValues.slot == undefined
      ) && this.formValues.barcode == undefined) {
        this.slotAlert = true;
        return;
      }

      if (
        this.formValues.day != undefined &&
        this.formValues.hall != undefined &&
        this.formValues.slot != undefined
      ) {
        axios.post(`/konter/sessions/${this.session.id}/slot/id/${this.formValues.slot.id}`).then(() => {
          this.$emit('reload');
        })
      }

    },

    beautifyTime(time: string): string {
      dayjs.extend(customParseFormat)
    
      return dayjs(time, "H:mm:ss").format("HH:mm")
    },

    getDayName(eventStart: Date | undefined, day: number): string {
      if (eventStart == undefined) {
        return "";
      }

      return dayjs(eventStart).add(day - 1, 'days').format("dddd")
    }
  }
});
</script>

<style scoped>
.card {
  --bs-card-spacer-y: 0.5rem;
  --bs-card-spacer-x: 0.7rem;
}

.w-4 {
  width: v-bind('size')px;
  min-width: v-bind('size')px;
  max-width: v-bind('size')px;
}

.session-title {
  min-width: 0;
  max-width: 75vw;
  white-space: nowrap;
}
</style>