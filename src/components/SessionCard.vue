<template>
  <div class="card d-flex m-1 bg-secondary bg-opacity-25" @click="sessionModal = true">
    <div class="card-body bg-opacity-75">
      <div class="row">
        <div class="col-10 align-self-start">
          <div class="row">
            <div class="align-self-center w-4">
              <svg class="col" :width="size" :height="size" :view-box="`0 0 ${size} ${size}`"  style="transform: rotate(-90deg)">
                <circle 
                  :r="size * 0.4" 
                  :cx="size * 0.5" 
                  :cy="size * 0.5" 
                  fill="transparent" 
                  stroke="#eaeaea" 
                  :stroke-width="`${size / 10}px`"
                />
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
                <text 
                  :font-size="size / 3.5" 
                  x="50%" 
                  y="-48%" 
                  font-weight="bold" 
                  dominant-baseline="middle" 
                  text-anchor="middle" 
                  transform="rotate(90)"
                >{{ session.rating || "N/A" }}</text>
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

          <div class="row">
            <div class="col float-end">
              <span class="badge rounded-pill ms-1" :class="`text-bg-${toColor.formatToColor(session.format).color}`">{{ toColor.formatToColor(session.format).label }}</span>
              <span class="badge rounded-pill ms-1" :class="`text-bg-${toColor.themeToColor(session.theme).color}`">{{ toColor.themeToColor(session.theme).label }}</span>
              <span class="badge rounded-pill ms-1" :class="`text-bg-${toColor.niveauToColor(session.niveau).color}`">{{ toColor.niveauToColor(session.niveau).label }}</span>
              <span class="badge rounded-pill ms-1" :class="`text-bg-${toColor.statusToColor(session.status).color}`">{{ toColor.statusToColor(session.status).label }}</span>
            </div>
          </div>
        </div>
        <div class="col align-self-center d-flex flex-row">
          <div class="d-flex flex-column justify-content-center align-items-center">
            <BiBuilding class="opacity-50" width="24" height="24" viewBox="0 0 16 16"/>
            <span class="fw-bold">Hall :</span>
            <span>{{ session.hall?.name || "No hall assigned"}}</span>
          </div>
          <button 
            type="button" 
            class="btn btn-primary rounded-circle m-auto d-flex align-items-center" 
            style="aspect-ratio: 1 !important;" 
            @click="(e) => { e.stopPropagation(); hallModal = true }"
          >
            <BiPencilSquare />
          </button>
        </div>
      </div>
    </div>
  </div>

  <ModalInfo v-model:open="sessionModal" :title="session.title">
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
    <hr>
    <h5>Description</h5>
    <p style="white-space: pre-wrap;">{{ session.description }}</p>
    <hr>
    <h5>Owner Notes</h5>
    <p style="white-space: pre-wrap;">{{ session.ownerNotes }}</p>
  </ModalInfo>
  
  <ModalForm v-model:open="hallModal" :title="'Hall selection for session : ' + session.title">
    <div class="mb-3"><b>Hall modification : </b></div>
    <div class="mb-3">
      <select id="hall" class="form-select" :value="session.hall">
        <option :value="undefined"></option>
        <option v-for="hall in availableHalls" :value="hall" :key="hall.id">{{ hall.name }}</option>
      </select>
    </div>
  </ModalForm>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { Session } from '@/dto/Session';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Speaker } from '@/dto/Speaker';
import * as toColor from '@/dto/SessionEnums';
import ModalInfo from "@/components/ModalInfo.vue";
import ModalForm from "@/components/ModalForm.vue";
import BiBuilding from 'bootstrap-icons/icons/building.svg?component';
import BiPencilSquare from 'bootstrap-icons/icons/pencil-square.svg?component';
import type { Hall } from '@/dto/Hall';

export default defineComponent({
  name: "SessionCard",

  components: { ModalInfo, ModalForm, BiBuilding, BiPencilSquare },

  props: {
    session: { type: Object as PropType<Session>, required: true },
    availableHalls: { type: Array<Hall>, required: true }
  },

  data() {
    return {
      toColor,
      loading: false,
      sessionModal: false,
      hallModal: false,
      size: 60
    }
  },

  methods: {
    colorFromRating(rating?: number | null): string {
      if (rating == null) {
        return '#eaeaea';
      } else {
        const gradient = [
          [255, 0, 0],
          [255, 255, 0],
          [0, 255, 0]
        ];

        let first: number[], second: number[], ratio: number;
        if (rating < 2.5) {
          [first, second] = gradient.slice(0, 2);
          ratio = rating / 2.5;
        } else {
          [first, second] = gradient.slice(1);
          ratio = (rating - 2.5) / 2.5;
        }

        return `rgb(${
          [
            Math.round(first[0] * (1 - ratio) + second[0] * ratio),
            Math.round(first[1] * (1 - ratio) + second[1] * ratio),
            Math.round(first[2] * (1 - ratio) + second[2] * ratio),
          ].join(', ')
        })`;
      }
    }
  }
})
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