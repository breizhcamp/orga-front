<template>
  <div class="flex-grow-1"> 
    {{ hall.name }}
    <i class="text-muted">
      {{ hall.trackId ? `(Track ${hall.trackId})` : '(No track assigned)' }}
    </i>
  </div>
  <button 
    type="button" 
    class="btn btn-sm btn-warning opacity-75 d-flex align-items-center me-1"
    @click="editModal = true"
  >
    <BiPencilSquare class="me-1"/> Edit
  </button>
  <button 
    type="button"   
    class="btn btn-sm btn-danger opacity-75 d-flex align-items-center"
    @click="deleteModal = true"
  >
    <BiTrash class="me-1"/> Delete
  </button>

  <ModalForm v-model:open="editModal" :title="'Edit hall ' + hall.name" @save="submit()">
    <div class="row row-cols-1 gy-3">
      <div class="col">
        <label for="hallName" class="form-label">Name</label>
        <input type="text" id="hallName" class="form-control" v-model="values.name">
      </div>
      
      <div class="col">
        <div class="alert alert-warning alert-dismissible" role="alert" v-if="editAlert">
          <div>Track Id is already assigned</div>
          <button type="button" class="btn-close" aria-label="Close" @click="editAlert = false"></button>
        </div>
        <label for="trackId" class="form-label">Track Id</label>
        <input type="number" id="trackId" class="form-control" v-model="values.id">
      </div>
    </div>
  </ModalForm>

  <div class="modal show d-block" tabindex="-1" v-if="deleteModal" @click="deleteClose()">
    <div class="modal-dialog" @click.stop>
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ 'Delete hall ' + hall.name }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="close" @click="deleteClose()"></button>
        </div>

        <div class="modal-body">
          <p>This will delete all information relative to this hall, even in existing events.</p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-dark" @click="deleteClose()">Cancel</button>
          <button type="button" class="btn btn-danger" @click="deleteSubmit()">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type PropType, defineComponent } from 'vue';
import type { Hall } from '@/dto/Hall'; 
import ModalForm from './ModalForm.vue';
import BiPencilSquare from 'bootstrap-icons/icons/pencil-square.svg?component';
import BiTrash from 'bootstrap-icons/icons/trash.svg?component';
import axios from 'axios';


export default defineComponent({
  name: "EventHallListItem",

  props: {
    hall: { type: Object as PropType<Hall>, required: true },
    existingTrackIds: { type: Array<Number>, required: true }
  },

  data() {
    return {
      editModal: false,
      editAlert: false,
      deleteModal: false,
      values: { name: this.hall.name, id: this.hall.trackId }
    }
  },

  emits: ['reload'],

  components: { ModalForm, BiPencilSquare, BiTrash },

  methods: {
    submit() {
      if (this.values.id != undefined && this.existingTrackIds.includes(this.values.id)) {
        this.editAlert = true;
        return;
      }
      axios.patch('/konter/halls/' + this.hall.id, this.values)
        .then(() => {
          this.$emit('reload');
          this.editModal = false;
        })
    },

    deleteClose() {
      this.deleteModal = false;
    },

    deleteSubmit() {
      axios.delete('/konter/halls/' + this.hall.id)
        .then(() => {
          this.$emit('reload');
          this.deleteClose();
        })
    }
  },
})
</script>