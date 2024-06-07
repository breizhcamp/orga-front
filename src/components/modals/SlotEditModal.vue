<template>
  <ModalForm v-model:open="modalOpen" :title="'Edit slot'">
    <div v-if="programSlot?.session != undefined">
      <div class="card">
        <div class="card-header">{{ programSlot.session.title }}</div>
        <div class="card-body">
          <SessionBadges :session="programSlot.session"/>
          <p>
            <b>Presented by :</b> {{ programSlot.session.speakers.map(s => s.firstname[0] + '. ' + s.lastname).join(', ') }}<br>
            
          </p>
        </div>
      </div>
    </div>
    <div v-else>
      <div>
        <label for="title" class="form-label">Add a title</label>
        <input type="text" id="title" class="form-control" :value="programSlot">
      </div>
      <div>
        <label for="tracks">Tracks</label>
        <ul class="list-group" id="tracks">
          <li class="list-group-item" v-for="hall in availableHalls" :key="hall.id" >
            <input type="checkbox" name="" :id="'checkbox_' + hall.id" class="form-check-input me-1" :checked="hallIds.includes(hall.id)" @change="(e) => toggleTrack(hall.id, e.target as HTMLInputElement)">
            <label :for="'checkbox_' + hall.id" class="form-check-label">{{ hall.name }}</label>  
          </li>
        </ul>
      </div>
    </div>
  </ModalForm>
</template>

<script lang="ts">
import type { Slot } from '@/dto/Slot';
import ModalForm from "@/components/modals/ModalForm.vue";
import { defineComponent, type PropType } from 'vue';
import SessionBadges from '../SessionBadges.vue';
import type { Hall } from '@/dto/Hall';


export default defineComponent({
  name: "SlotEditModal",

  components: { ModalForm, SessionBadges },

  props: {
    open: { type: Boolean, required: true },
    programSlot: { type: Object as PropType<Slot>, required: false },
    availableHalls: { type: Object as PropType<Array<Hall>>, required: true }
  },

  emits: ['close'],

  watch: {
    open() {
      if (this.open) {
        if (this.programSlot != undefined) {
          this.hallIds = this.programSlot?.halls.map(h => h.id)
        }

        this.diff = { remove: [], add: [] }

        this.modalOpen = true
      }
    },

    modalOpen() {
      if (!this.modalOpen) {
        this.$emit('close')
      }
    }
  },

  data() {
    return {
      modalOpen: this.open,
      diff: { remove: [], add: [] } as { remove: number[], add: number[] },
      hallIds: [] as number[]
    }
  },

  methods: {
    toggleTrack(id: number, target: HTMLInputElement) {
      if (target.checked) {
        this.addTrack(id);
      } else {
        this.removeTrack(id);
      }
    },

    addTrack(id: number) {
      if (this.diff.remove.includes(id)) {
        this.diff.remove = this.diff.remove.filter(i => i !== id)
        return
      }

      this.diff.add.push(id)
    },

    removeTrack(id: number) {
      if (this.diff.add.includes(id)) {
        this.diff.add = this.diff.add.filter(i => i !== id)
        return
      }

      this.diff.remove.push(id)
    }
  }
})
</script>