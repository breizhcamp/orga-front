<template>
  <button 
    style="cursor: pointer"
    :id="computeId(index)"
    class="card w-100 d-flex flex-row m-1 bg-secondary bg-opacity-25" 
    @click="sessionModal = true"
    @keydown.up.prevent="focusSession(index - 1)"
    @keydown.down.prevent="focusSession(index + 1)"
    @keydown.escape.prevent="focusTopButton()"
  >
    <div class="card-body text-start bg-opacity-100">
      <div class="row">
        <div class="align-self-start" :class="editRights ? 'col-8' : 'col-10'">
          <div class="d-flex flex-row align-items-start">
            <div class="w-4" aria-hidden="true"> 
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
            <div class="col ms-2">
              <h3 class="fs-5 mb-0"><b>{{ session.title }}</b></h3>
              <i>
                {{ session.speakers.map((speaker: Speaker) =>
                  speaker.firstname + ' ' + speaker.lastname
                ).join(', ') }}
              </i>
            </div>
          </div>
          <SessionBadges :session="session" aria-hidden="true"/>
        </div>
        <div class="col-2 d-flex flex-column justify-content-center">
          <BiPersoVideo3
            class="opacity-50 mx-auto"
            width="24"
            height="24"
            viewBox="0 0 16 16"
            aria-hidden="true"
          />
          <span v-if="session.slot != undefined" class="d-inline-block mx-auto text-center">
            Hall : <b>{{ session.slot.halls[0]?.name }}</b>
            <br>
            On <b>
              {{ getDayName(eventStart, session.slot.day) }}
            </b> at <b>
              {{ beautifyTime(session.slot.start) }}
            </b>
          </span>
          <i v-else class="d-inline-block mx-auto text-center">
            No slot assigned
          </i>
        </div>
        <div v-if="editRights" class="col-2 d-flex align-items-center justify-content-center">
          <button
            type="button"
            class="btn btn-warning btn-outline-dark d-flex align-items-center"
            @click="(e) => {
              // Stopping propagation to prevent the sessionModal from opening
              e.stopPropagation();
              slotModal = true;
            }"
          >
            Edit <BiPencilSquare class="ms-1" aria-hidden="true"/>
          </button>
        </div>
      </div>
    </div>
  </button>

  <SessionModal :open="sessionModal" @close="sessionModal = false" :session="session" />
  
  <ModalForm v-model:open="slotModal" :title="'Slot selection for session : ' + session.title" @save="saveSlotModal()">
    <div class="mb-3">
      <b>Session infos : </b>
      <SessionBadges :session="session" aria-hidden="true"/>
    </div>

    <div class="alert alert-warning alert-dismissible" role="alert" v-if="slotAlert">
      <div>Either the three fields marked with a <b style="color: red;">*</b> or the barcode should be filled</div>
      <button type="button" class="btn-close" aria-label="Close" @click="slotAlert = false" ></button>
    </div>

    <div v-if="slots != undefined" class="row mb-3 gy-3">
      <div class="col-6">
        <label for="day" class="form-label">Day <b style="color: red;">*</b></label>
        <select id="day" class="form-control" v-model="formValues.day">
          <option :value="undefined"></option>
          <option 
            v-for="day in slots.entries()" 
            :key="day[0]" 
            :value="day[0]"
          >Day {{ day[0] }}</option>
        </select>
      </div>

      <div class="col-6">
        <label for="hall" class="form-label">Hall <b style="color: red;">*</b></label>
        <select id="hall" class="form-control" :disabled="formValues.day == undefined" v-model="formValues.hallId">
          <option :value="undefined"></option>
          <option 
            v-for="hall in slots.get(formValues.day!)?.entries()" 
            :key="hall[0].id" 
            :value="hall[0].id"
          >{{ hall[0].name }}</option>
        </select>
      </div>

      <div class="col-12">
        <label for="slot" class="form-label">Slot <b style="color: red;">*</b></label>
        <select id="slot" class="form-control" :disabled="formValues.day == undefined || formValues.hallId == undefined" v-model="formValues.slotId">
          <option :value="undefined"></option>
          <option v-for="slot in (slots.get(formValues.day!) != undefined) ? Array.from(slots.get(formValues.day!)!.entries()).find(e => e[0].id === formValues.hallId)?.[1].filter(slot => slot.assignable && (slot.session == undefined || slot.session?.id == session.id)) : []" :key="slot.id" :value="slot.id">
            {{ slot.title }} - {{ beautifyTime(slot.start) }} - {{ beautifyDuration(slot.duration) }}
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
import { defineComponent, inject } from 'vue';
import type { PropType } from 'vue';
import type { Session } from '@/dto/Session';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Speaker } from '@/dto/Speaker';
import * as sessionEnums from '@/dto/SessionEnums';
import SessionModal from "@/components/modals/SessionModal.vue";
import ModalForm from "@/components/modals/ModalForm.vue";
import SessionBadges from '@/components/SessionBadges.vue';
import BiPersoVideo3 from 'bootstrap-icons/icons/person-video3.svg?component';
import BiPencilSquare from 'bootstrap-icons/icons/pencil-square.svg?component';
import type { Hall } from '@/dto/Hall';
import type { Slot } from '@/dto/Slot';
import axios from 'axios';
import dayjs from 'dayjs';
import { beautifyDuration, beautifyTime } from '@/utils/time';
import type Keycloak from 'keycloak-js';
import { keycloakKey } from '@/provide-keys'

interface SlotFormValues {
  day?: number
  hallId?: number
  slotId?: string
  barcode?: string
}

export default defineComponent({
  name: "SessionCard",

  components: { SessionModal, ModalForm, SessionBadges, BiPersoVideo3, BiPencilSquare },

  props: {
    session: { type: Object as PropType<Session>, required: true },
    availableHalls: { type: Array<Hall>, required: true },
    slots: { type: Object as PropType<Map<number, Map<Hall, Array<Slot>>> | null>, required: false }, 
    eventStart: { type: Date, required: false },
    forceModal: { type: Boolean, required: true },
    index: { type: Number, required: true },
    last: { type: Boolean, required: true }
  },

  emits: [
    'reload',
    'focus-back-to-top'
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
      formValues: {
        day: this.session.slot?.day,
        hallId: this.session.slot?.halls[0].id,
        slotId: this.session.slot?.id,
        barcode: this.session.slot?.barcode,
      } as SlotFormValues,
      editRights: (inject(keycloakKey) as Keycloak).hasRealmRole("admin")
    };
  },

  created() {
    this.initModal();
  },

  watch: {

    forceModal() {
      this.initModal();
    },

    slotModal() {
      if (this.slotModal) {
        this.formValues = {
          day: this.session.slot?.day,
          hallId: this.session.slot?.halls[0].id,
          slotId: this.session.slot?.id,
          barcode: this.session.slot?.barcode,
        }
        this.slotAlert = false;
      }
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
        this.formValues.hallId == undefined ||
        this.formValues.slotId == undefined
      ) && this.formValues.barcode == undefined) {
        this.slotAlert = true;
        return;
      }

      if (
        this.formValues.day != undefined &&
        this.formValues.hallId != undefined &&
        this.formValues.slotId != undefined
      ) {
        axios.post(`/konter/sessions/${this.session.id}/slot/id/${this.formValues.slotId}`).then(() => {
          this.$emit('reload');
          this.formValues = {};
          this.slotModal = false;
        })
        return;
      }

      if (this.formValues.barcode != undefined) {
        axios.post(`/konter/sessions/${this.session.id}/slot/barcode/${this.formValues.barcode}`).then(() => {
          this.$emit('reload');
          this.formValues = {};
          this.slotModal = false;
        })
        return;
      }

    },

    getDayName(eventStart: Date | undefined, day: number): string {
      if (eventStart == undefined) {
        return "";
      }

      return dayjs(eventStart).add(day - 1, 'days').format("dddd")
    },

    computeId(index: Number): string  {
      return 'session-' + index;
    },

    focusSession(index: number) {
      if (document.activeElement != null) {
        (document.activeElement as HTMLElement).blur();
      }
      if (index < 0) {
        document.getElementById('session-filter-search-button')?.focus();
      } else if (this.last) {
        this.focusTopButton();
      } else {
        document.getElementById(this.computeId(index))?.focus();
      }
    },

    focusTopButton() {
      if (document.activeElement != null) {
        (document.activeElement as HTMLElement).blur();
      }
      this.$emit('focus-back-to-top');
    },

    beautifyTime,
    beautifyDuration
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
</style>