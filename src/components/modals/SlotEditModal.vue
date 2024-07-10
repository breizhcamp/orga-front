<template>
  <SessionModal 
    v-if="programSlot?.session != undefined"
    :open="modalOpen"
    :session="programSlot.session"
    @close="modalOpen = false"
  />
  <ModalForm v-else v-model:open="modalOpen" :title="'Edit slot'" @save="submit()">
    <div class="row row-cols-2 gy-3">
      <div class="col">
        <label for="title" class="form-label">Title</label>
        <input
          type="text"
          id="title"
          class="form-control"
          :value="programSlot?.title"
          @input="e => title = (e.target as HTMLInputElement).value"
        >
      </div>
      <div class="col no-label">
        <ul class="list-group">
          <li class="list-group-item">
            <div class="form-check form-switch">
              <label for="assignable" class="form-check-label stretched-link">Assignable</label>
              <input
                type="checkbox"
                class="form-check-input me-1"
                id="assignable"
                :checked="programSlot?.assignable"
                @change="toggleAssignable()"
              >
            </div>
          </li>
        </ul>
      </div>
      <div class="col-12">
        <label for="barcode" class="form-label">Barcode</label>
        <div class="input-group" id="barcode" >
          <input 
            type="text" 
            class="form-control" 
            disabled 
            :value="programSlot?.barcode"
          >
          <button 
            type="button" 
            class="btn d-flex align-items-center" 
            :class="copied ? 'btn-success' : 'btn-secondary'" 
            aria-label="Copy to clipboard"
            @click="copy(programSlot?.barcode)"
          >
            <BiCheckLg v-if="copied" aria-hidden="true" />
            <BiCopy v-else aria-hidden="true" />
          </button>
        </div>
      
      </div>
      <div class="col-12">
        <label for="tracks">Tracks</label>
        <ul class="list-group" id="tracks">
          <li class="list-group-item" v-for="hall in availableHalls" :key="hall.id" >
            <input 
              type="checkbox"
              :id="'checkbox_' + hall.id"
              class="form-check-input me-1"
              :checked="hallIds.includes(hall.id)"
              @change="(e) => toggleTrack(hall.id, e.target as HTMLInputElement)"
            >
            <label :for="'checkbox_' + hall.id" class="form-check-label stretched-link">
              {{ hall.name }}
            </label>
          </li>
        </ul>
      </div>
    </div>
    <MonoFieldAlert 
      title="This slot creates a conflict with an existing slot" 
      :alert="alert" 
      @dismiss="alert.display = false"
    />
  </ModalForm>
</template>

<script lang="ts">
import type { Slot } from '@/dto/Slot';
import ModalForm from "@/components/modals/ModalForm.vue";
import { defineComponent, type PropType } from 'vue';
import SessionModal from '@/components/modals/SessionModal.vue';
import type { Hall } from '@/dto/Hall';
import axios from 'axios';
import MonoFieldAlert from '@/components/MonoFieldAlert.vue';
import type { MonoFieldAlertValues } from '@/dto/Alert';
import type { SlotPatchReq } from '@/dto/Requests';
import BiCopy from 'bootstrap-icons/icons/copy.svg?component'
import BiCheckLg from 'bootstrap-icons/icons/check-lg.svg?component'

export default defineComponent({
  name: "SlotEditModal",

  components: { ModalForm, MonoFieldAlert, SessionModal, BiCopy, BiCheckLg },

  props: {
    open: { type: Boolean, required: true },
    eventId: { type: Number, required: true },
    programSlot: { type: Object as PropType<Slot>, required: false },
    availableHalls: { type: Object as PropType<Array<Hall>>, required: true }
  },

  emits: ['reload-a', 'reload-b', 'close'],

  watch: {
    open() {
      if (this.open) {
        if (this.programSlot != undefined) {
          this.hallIds = this.programSlot.halls.map(h => h.id)
        }

        this.alert = { display: false, content: "" }
        this.diff = { remove: [], add: [] }
      }
      this.modalOpen = this.open
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
      title: this.programSlot?.title as string,
      assignable: this.programSlot?.assignable as boolean,
      hallIds: [] as number[],
      alert: { display: false, content: "" } as MonoFieldAlertValues,
      copied: false
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
    },

    toggleAssignable() {
      this.assignable = !this.assignable;
    },

    submit() {
      if (this.programSlot == undefined) {
        return;
      }

      let slot = this.programSlot

      this.alert.content = "";
      let errored = false;

      let request = {
        assignable: this.assignable
      } as SlotPatchReq

      if (this.title != slot.title) {
        request.title = this.title
      }

      axios.patch("/konter/slots/" + slot.id, request)
        .then(() => this.$emit('reload-a'))

      Promise.all(this.diff.add.map(id => 
        axios.post(`/konter/slots/hall/${slot.id}/${this.eventId}/${id}`)
          .catch((error) => {
            if (error.response.status === axios.HttpStatusCode.Conflict && error.response != undefined) {
              this.alert.content += error.response.data + '\n';
              this.alert.display = true;
              errored = true;
            }
          })
      )).then(() => {
        if (errored) {
          return
        }
        Promise.all(this.diff.remove.map(id => {
          axios.delete(`/konter/slots/hall/${slot.id}/${id}`)
        })).then(() => {
          this.$emit('reload-b')
        })
      })
    },

    copy(text: string | undefined) {
      if (text == undefined) {
        return
      }
      navigator.clipboard.writeText(text).then(() => {
        this.copied = true;
        setTimeout(() => this.copied = false, 1500)
      })
    }
  }
})
</script>