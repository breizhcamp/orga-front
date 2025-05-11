<template>
  <td
    v-if="
      slotAndSpan != undefined &&
      slotAndSpan.rowspan != undefined &&
      slotAndSpan.colspan != undefined &&
      slotAndSpan.slot != undefined"
    class="h-100"
    :rowspan="slotAndSpan.rowspan"
    :colspan="slotAndSpan.colspan"
  >
    <div
      class="h-100 card d-flex"
      :class="'text-bg-' + (
        slotAndSpan.slot.session != undefined ?
        themeToBadgeInfos(slotAndSpan.slot.session?.theme).color :
        'secondary'
      )"
      @click.stop="$emit('edit')">
      <div class="card-body p-1 d-flex align-items-center align-middle">
        <div class="d-flex flex-grow-1 flex-column justify-content-center">
          <div class="row mx-auto user-select-none">
            <b
              class="truncate"
              v-if="slotAndSpan.slot.session?.title || slotAndSpan.slot.title"
            >
              <small>{{ slotAndSpan.slot?.start }} - {{ slotAndSpan.slot?.duration }}</small><br>
              {{ slotAndSpan.slot.session?.title || slotAndSpan.slot.title }}
            </b>
            <i v-else>Empty</i>
          </div>
        </div>
        <div v-if="editable" class="row d-flex flex-row flex-wrap m-0 p-0">
          <button
            type="button"
            class="d-flex align-items-center px-1 justify-content-center btn btn-sm btn-outline-dark btn-light mb-1"
            aria-roledescription="Edit Slot"
            @click.stop="$emit('edit')"
          >
            Edit <BiPencilSquare class="me-0 ms-1" aria-hidden="true"/>
          </button>

          <button
            type="button"
            class="d-flex align-items-center px-1 justify-content-center btn btn-sm btn-outline-dark btn-light"
            aria-roledescription="Remove Slot"
            @click.stop="removeSlot(slotAndSpan.slot?.id)"
          >
            Remove <BiTrash class="ms-1" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </td>
  <td v-else-if="slotAndSpan != undefined && slotAndSpan.display" :class="editable ? 'assignable': ''"></td>
</template>

<script lang="ts">
import type { Slot } from '@/dto/Slot';
import { themeToBadgeInfos } from "@/dto/SessionEnums";
import { defineComponent, type PropType } from 'vue';
import BiPencilSquare from 'bootstrap-icons/icons/pencil-square.svg?component';
import BiTrash from 'bootstrap-icons/icons/trash.svg?component';
import axios from 'axios';

export interface SlotSessionTDOptions { slot?: Slot, rowspan?: number, colspan?: number, display: Boolean }

export default defineComponent({
  name: 'SlotSessionTableData',

  components: { BiPencilSquare, BiTrash },

  props: {
    slotAndSpan: { type: Object as PropType<SlotSessionTDOptions>, required: true },
    editable: { type: Boolean, required: true }
  },

  emits: ['reload', 'edit'],

  methods: {
    themeToBadgeInfos,

    removeSlot(id: string | undefined) {
      axios.delete('/konter/slots/' + id).then(() => {
        this.$emit('reload');
      })
    }
  }
})
</script>

<style scoped>
.assignable:hover {
  cursor: pointer;
  background-color: lightblue;
  font-weight: bold;
}

.assignable:hover::before {
  content: "Add slot here";
}

.truncate {
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  display: -webkit-box;
}
</style>
