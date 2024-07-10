<template>
  <div>
    <ToolBar 
      :title="'Program for ' + event.name" 
      :actions="actions" 
      sub-view 
      parent-title="Events" 
      parent-route="/events"
    />

    <div class="minh m-3">
      <div v-if="editable" class="d-flex flex-nowrap align-items-center justify-content-center">
        <div 
          class="input-group input-group-sm mx-2"
          style="width: fit-content;" 
          role="group"
          v-for="(hall, index) in availableHalls" 
          :key="hall.id"
        >
          <button 
            v-if="index != 0"
            type="button"
            class="btn btn-sm btn-secondary d-flex align-items-center" 
            aria-label="Move track to the left"
            @click="swapOrder(index - 1, index)"
          >
            <BiCaretLeft aria-disabled />
          </button>
          <div class="input-group-text text-bg-info">
            {{ hall.name }}
          </div>
          <button 
            type="button" 
            class="btn btn-sm btn-danger d-flex align-items-center"
            aria-label="Remove track"
            @click="removeTrack(hall.id)"
          >
            <BiXLg />
          </button>
          <button 
            v-if="index != availableHalls.length - 1"
            type="button" 
            class="btn btn-sm btn-secondary d-flex align-items-center" 
            aria-label="Move track to the right"
            @click="swapOrder(index, index + 1)"
          >
            <BiCaretRight aria-disabled />
          </button>
        </div>
        <div class="dropdown col-auto" v-if="halls.length !== availableHalls.length">
          <button 
            type="button" 
            class="btn btn-sm text-bg-warning rounded dropdown-toggle" 
            @click="trackDropdown = !trackDropdown" 
            :class="trackDropdown ? 'show' : ''"
          >Add Track</button>
          <ul class="dropdown-menu" :class="trackDropdown ? 'show' : ''">
            <li 
              class="dropdown-item" 
              v-for="hall in halls.filter(
                h => !availableHalls.map(h => h.id).includes(h.id))" 
              :key="hall.id">
              <a style="user-select: none;" @click="addTrack(hall.id)">
                {{ hall.name }} (Track {{ hall.trackId }})
              </a>
            </li>
          </ul>
        </div>
      </div>

      <h2 class="text-center m-3" v-if="availableHalls.length === 0">Add at least one track in order to edit and display the program</h2>
      <h2 
        class="text-center m-3" 
        v-else-if="event.debutEvent === null || event.finEvent === null"
      >Event begin and end dates have to be set in order to edit and display the program</h2>

      <div v-else>
        <div class="mt-3" v-for="day in getEventDays(event)" :key="day.index">
          <div v-if="Array.from(slots.keys()).includes(day.index)" class="text-center">
            <h3>{{ day.date.format("dddd - D/M/YYYY") }}</h3>
              <table style="width: 100%;" class="border">
                <thead>
                  <tr class="text-center">
                    <th class="border"></th>
                    <th
                      class="border"
                      v-for="hall in availableHalls"
                      :key="hall.id"
                      :style="{ width: 90 / availableHalls.length + '%'}"
                    >
                      {{ hall.name }}
                      <i class="text-muted">{{ `(Track ${hall.trackId})` }}</i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="stamp in getTimestamps(slots.get(day.index)!, availableHalls)" :key="stamp.time.unix()">
                    <td
                      v-if="Array.from(stamp.tracks.values()).filter(s => s.slot != undefined || !s.display).length == 0"
                    class="border"
                    :class="editable ? 'empty-row' : ''"
                      @click="openAddSlotModal(availableHalls[0], day, stamp.time, true)"
                    >
                      {{ stamp.time.format("HH:mm") }}
                    </td>
                    <td v-else class="border" style="width: 10%;">
                      {{ stamp.time.format("HH:mm") }}
                    </td>
                    <SlotSessionTableData
                      class="border"
                      v-for="hall in availableHalls"
                      :key="hall.id"
                      :slot-and-span="stamp.tracks.get(hall.id)!"
                      @reload="loadSlots()"
                      @edit="editSlot(stamp.tracks.get(hall.id)?.slot)"
                      @click.stop="openAddSlotModal(hall, day, stamp.time)"
                    :editable="editable"
                    />
                  </tr>
              </tbody>
              <tfoot v-if="editable">
                  <tr>
                    <td></td>
                    <td class="border text-align-center" v-for="hall in availableHalls" :key="hall.id">
                      <div class="d-flex justify-content-center">
                        <button
                          type="button"
                          class="btn btn-success d-inline-block m-1"
                          @click.stop="openAddSlotModal(hall, day)"
                        >Add slot</button>
                        <button
                          type="button"
                          class="btn btn-warning d-inline-block m-1"
                          v-if="Array.from(slots.get(day.index)!.entries()).filter(e => e[0].id === hall.id && e[1].length > 0).length === 0"
                          @click.stop="openTemplateModal(hall, day)"
                        >Add template</button>
                        <button
                          type="button"
                          class="btn btn-danger d-inline-block m-1"
                          v-else
                          @click.stop="emptyTrack(day.index, hall.id)"
                        >Remove all slots</button>
                      </div>
                    </td>
                  </tr>
              </tfoot>
              </table>
            </div>
          <div v-else class="text-center">
            <h3>{{ day.date.format("dddd - D/M/YYYY") }}</h3>
            <div>
              <table style="width: 100%;" class="border">
                <thead>
                  <tr class="text-center">
                    <th class="border"></th>
                    <th
                      class="border"
                      v-for="hall in availableHalls"
                      :key="hall.id"
                      :style="{ width: 90 / availableHalls.length + '%'}"
                    >
                      {{ hall.name }}
                      <i class="text-muted">{{ `(Track ${hall.trackId})` }}</i>
                    </th>
                  </tr>
                </thead>
                <tfoot v-if="editable">
                  <tr>
                    <td></td>
                    <td class="border text-align-center" v-for="hall in availableHalls" :key="hall.id">
                      <div class="d-flex justify-content-center">
                        <button
                          type="button"
                          class="btn btn-success d-inline-block my-1 mx-1"
                          @click="openAddSlotModal(hall, day)"
                        >Add slot</button>
                        <button
                          type="button"
                          class="btn btn-warning d-inline-block my-1 mx-1"
                          @click="openTemplateModal(hall, day)"
                        >Add template</button>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <SlotModal
    :open="slotModal"
    :event="event"
    :available-halls="availableHalls"
    :day="slotModalDay"
    :time="slotModalTime"
    :halls="slotModalHalls"
    @reload="loadSlots()"
    @close="slotModal = false"
  />

  <SlotEditModal
    :open="editSlotModal"
    :event-id="Number($route.params.eventId)"
    :program-slot="editSlotValue"
    :available-halls="availableHalls"
    @reload-a="reloadSlotsA = true"
    @reload-b="reloadSlotsB = true"
    @close="editSlotModal = false"
  />

  <SlotTemplateModal
    :open="templateModal"
    :event="event"
    :hall="templateModalHall"
    :day="templateModalDay"
    @reload="loadSlots()"
    @close="templateModal = false"
  />
</template>

<script lang="ts">
import ToolBar from '@/components/ToolBar.vue';
import { EventParticipants, type EventDTO } from '@/dto/EventDTO';
import type { Hall } from '@/dto/Hall';
import type { Slot } from '@/dto/Slot';
import axios, { type AxiosResponse } from 'axios';
import { defineComponent, inject, shallowRef } from 'vue';
import SlotModal from '@/components/modals/SlotModal.vue';
import SlotEditModal from '@/components/modals/SlotEditModal.vue';
import SlotTemplateModal from '@/components/modals/SlotTemplateModal.vue';
import SlotSessionTableData, { type SlotSessionTDOptions } from '@/components/SlotSessionTableData.vue';
import BiXLg from 'bootstrap-icons/icons/x-lg.svg?component';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import durationPlugin from 'dayjs/plugin/duration';
import { manualSessionDTOToManualSession, sessionDTOToSession, type ManualSessionDTO, type SessionDTO } from '@/dto/Session';
import { downloadFileWithNameAndType, downloadPdfWithName } from '@/utils/download';
import type { Action } from '@/dto/Action';
import BiFilePdf from 'bootstrap-icons/icons/file-pdf.svg?component'
import BiBraces from 'bootstrap-icons/icons/braces.svg?component'
import BiCaretLeft from 'bootstrap-icons/icons/caret-left.svg?component';
import BiCaretRight from 'bootstrap-icons/icons/caret-right.svg?component';
import { keycloakKey } from '@/provide-keys';
import type Keycloak from 'keycloak-js';

export default defineComponent({
  name: "ProgramView",
  components: { 
    ToolBar, 
    SlotModal, 
    SlotEditModal, 
    SlotTemplateModal, 
    SlotSessionTableData, 
    BiXLg, 
    BiCaretLeft, 
    BiCaretRight 
  },

  data() {
    return {
      event: {} as EventDTO,
      halls: [] as Array<Hall>,
      availableHalls: [] as Array<Hall>,
      trackDropdown: false,
      slots: new Map() as Map<number, Map<Hall, Slot[]>>,

      slotModal: false, 
      slotModalHalls: [] as Array<Hall>,
      slotModalDay: undefined as {index: number, date: Dayjs} | undefined,
      slotModalTime: undefined as Dayjs | undefined,

      editSlotModal: false, 
      editSlotValue: undefined as Slot | undefined,

      templateModal: false, 
      templateModalHall: undefined as Hall | undefined,
      templateModalDay: undefined as { index: number, date: Dayjs } | undefined,

      actions: [] as Array<Action>,

      reloadSlotsA: false,
      reloadSlotsB: false,

      editable: (inject(keycloakKey) as Keycloak).hasRealmRole("admin")
    }
  },

  mounted() {
    this.load()
    this.actions = [
      { 
        label: "Export program as PDF",
        title: "Export program",
        function:  this.exportPdf, 
        // @ts-ignore : We pass a shallowRef instead of the component
        icon: shallowRef(BiFilePdf)
      },
      { 
        label: "Export talks.json",
        title: "Export talks",
        function:  this.exportTalks, 
        // @ts-ignore : We pass a shallowRef instead of the component
        icon: shallowRef(BiBraces)
      },
    ]
  },

  watch: {
    $route() {
      this.load()
    },

    reloadSlotsA() {
      if (this.reloadSlotsB) {
        this.loadSlots()
        this.editSlotModal = false;
      }
    },

    reloadSlotsB() {
      if (this.reloadSlotsA) {
        this.loadSlots()
        this.editSlotModal = false;
      }
    }
  },

  methods: {
    load() {
      this.loadEvent(Number(this.$route.params.eventId))
        .then(this.loadHalls)
        .then(this.loadAvailableHalls)
        .then(this.loadSlots)
      this.trackDropdown = false
    },

    async loadEvent(id: number): Promise<void> {
      return axios.get('/kalon/events/' + id).then((response: AxiosResponse<EventDTO>) => {
        let event = { ...response.data };
        event.participants = new EventParticipants(event.participants as Array<any>);

        if (event.debutEvent) {
          event.debutEvent = new Date(event.debutEvent);
        }
        if (event.finEvent) {
          event.finEvent = new Date(event.finEvent);
        }
        if (event.debutCFP) {
          event.debutCFP = new Date(event.debutCFP);
        }
        if (event.finCFP) {
          event.finCFP = new Date(event.finCFP);
        }
        if (event.debutInscription) {
          event.debutInscription = new Date(event.debutInscription);
        }
        if (event.finInscription) {
          event.finInscription = new Date(event.finInscription);
        }

        this.event = event;
      })
    },

    loadSlots() {
      try {
        axios.get('/konter/slots/event/' + this.$route.params.eventId).then(
          (response: AxiosResponse<Map<number, Map<number, Array<Slot>>>>) => {
            try {
              this.slots = new Map(Object.entries(response.data).map(
                row => [ Number(row[0]), new Map(Object.entries(row[1]).map(
                  column => [ this.halls.find(h => h.id == Number(column[0]))!!, (column[1] as Slot[]).map(s => {
                    let slot = { ...s };
                    slot.session = (slot.session != null) ? sessionDTOToSession(slot.session as unknown as SessionDTO) : undefined;
                    return slot;
                  }) ]
                ))]
              ));
            } catch (e) {
              this.slots = new Map();
            } finally {
              this.reloadSlotsA = false;
              this.reloadSlotsB = false;
            }
          }
        )
      } catch (error) {
        console.error(error)
      }
      this.editSlotModal = false;
    },

    async loadAvailableHalls() {
      this.availableHalls = [];

      return axios.get("/konter/halls/" + this.$route.params.eventId)
        .then((response: AxiosResponse<Hall[]>) => this.availableHalls = response.data)
    },

    async loadHalls(): Promise<void> {
      this.halls = [];
      return axios.get('/konter/halls').then((response: AxiosResponse<Hall[]>) => {
        this.halls = response.data;
      })
    },

    addTrack(id: number) {
      axios.post(`/konter/halls/${id}/event/${this.$route.params.eventId}/${this.availableHalls.length}`)
        .then(this.load)
    },

    swapOrder(leftIndex: number, rightIndex: number) {
      let leftHallId = this.availableHalls[leftIndex].id
      let rightHallId = this.availableHalls[rightIndex].id
      this.setOrder(leftHallId, rightIndex)
        .then(() => this.setOrder(rightHallId, leftIndex))
        .then(this.load)
    },

    async setOrder(id: number, order: number) {
      return axios.patch(`/konter/halls/${id}/event/${this.$route.params.eventId}/${order}`)
    },
    
    removeTrack(id: number) {
      axios.delete(`konter/halls/${id}/event/${this.$route.params.eventId}`).then(
        this.load
      )
    },

    getEventDays(event: EventDTO): { index: number, date: Dayjs }[] {
      if (
        event.debutEvent == undefined || 
        event.finEvent == undefined || 
        dayjs(event.debutEvent).isAfter(dayjs(event.finEvent))
      ) {
        return []
      }
    
      return Array.from(
          Array(dayjs(event.finEvent).diff(dayjs(event.debutEvent), 'days') + 1)
          .keys()
        ).map(n => {return {
          index: n + 1,
          date: dayjs(event.debutEvent).add(n, "days")
        }}) 
    },

    getTimestamps(tracks: Map<Hall, Slot[]>, halls: Hall[])
      : Array<{ time: Dayjs, tracks: Map<number, SlotSessionTDOptions> }> {
      dayjs.extend(customParseFormat);
      dayjs.extend(durationPlugin);

      let tracksById = new Map(Array.from(tracks.entries()).map(entry => [entry[0].id, entry[1]]));
      halls.forEach(h => {
        if (!tracksById.has(h.id)) {
          tracksById.set(h.id, [])
        }
      })

      let min: Dayjs = dayjs().hour(23), max: Dayjs = dayjs().hour(0);
      let hallIter = tracksById.values();
      let currentHall = hallIter.next();

      while (!currentHall.done) {
        currentHall.value.forEach(s => {
          const begin = dayjs(s.start, "H:mm:ss");
          if (min == null || begin.isBefore(min)) {
            min = begin;
          }
          const end = begin.add(dayjs.duration(s.duration));
          if (max == null || end.isAfter(max)) {
            max = end;
          }
        })

        currentHall = hallIter.next();
      }

      min = min.minute(Math.floor(min.minute() / 30) * 30);
      max = max.minute(Math.ceil(max.minute() / 30) * 30);

      let rowsToConsume: Map<number, number> = new Map();
      let tracksMap: Map<number, SlotSessionTDOptions> = new Map();

      halls.forEach((h: Hall, index: number) => {
        if (!tracksMap.has(h.id)) {
          const slots = tracksById.get(h.id)
          if (slots != undefined) {
            const slot = this.getSlotAtTime(slots, min);
            if (slot.slot != undefined && slot.rowspan != undefined) {
              rowsToConsume.set(h.id, slot.rowspan)
              tracksMap.set(h.id, { slot: slot.slot, rowspan: slot.rowspan, colspan: slot.slot.span, display: true } as SlotSessionTDOptions);
              if (slot.slot.span > 1) {
                for(let i = 1; i < slot.slot.span; i++) {
                  rowsToConsume.set(halls[index + i].id, slot.rowspan)
                  tracksMap.set(halls[index + i].id, { slot: undefined, rowspan: undefined, colspan: undefined, display: false } as SlotSessionTDOptions)
                }
              }
            } else {
              rowsToConsume.set(h.id, 0)
              tracksMap.set(h.id, { slot: undefined, rowspan: undefined, colspan: undefined, display: true } as SlotSessionTDOptions);
            }
          } else {
            rowsToConsume.set(h.id, 0)
            tracksMap.set(h.id, { slot: undefined, rowspan: undefined, colspan: undefined, display: true } as SlotSessionTDOptions);
          }
        }
      })

      let current = { time: min, tracks: new Map(tracksMap) };

      let values: Array<{ time: Dayjs, tracks: Map<number, SlotSessionTDOptions> }> = [];

      while (current.time.isBefore(max)) {
        values.push({ time: current.time, tracks: new Map(current.tracks) });
        current.tracks = new Map()
        current.time = current.time.add(15, "minute");
        
        tracksById.forEach((value, key) => {
          if (!current.tracks.has(key)) {
            const slot = this.getSlotAtTime(value, current.time)
            if (slot.slot != undefined && slot.rowspan != undefined) {
              rowsToConsume.set(key, slot.rowspan)
              current.tracks.set(key, { slot: slot.slot, rowspan: slot.rowspan, colspan: slot.slot.span, display: true } as SlotSessionTDOptions);
              if (slot.slot.span > 1) {
                let index = halls.findIndex(h => h.id == key)
                for(let i = 1; i < slot.slot.span; i++) {
                  rowsToConsume.set(halls[index + i].id, slot.rowspan)
                  current.tracks.set(halls[index + i].id, { slot: undefined, rowspan: undefined, colspan: undefined, display: false } as SlotSessionTDOptions)
                }
              }
            } else {
              rowsToConsume.set(key, rowsToConsume.get(key)! - 1)
              current.tracks.set(key, { slot: undefined, rowspan: undefined, colspan: 1, display: rowsToConsume.get(key)! < 1 } as SlotSessionTDOptions);
            }
          }
        })
      }

      return values;
    },

    getSlotAtTime(slots: Slot[] | undefined, time: Dayjs): { slot?: Slot, rowspan?: number } {
      if (slots == undefined) {
        return { slot: undefined, rowspan: undefined };
      }

      const slot = slots.find(s => {
        const start = dayjs(s.start, "H:mm:ss");
        return (start.isAfter(time) && start.isBefore(time.minute(time.minute() + 15))) || start.isSame(time);
      });

      if (slot == undefined) {
        return { slot: undefined, rowspan: undefined };
      }

      const span = Math.ceil(dayjs.duration(slot.duration).asMinutes() / 15);
      return { slot, rowspan: span };
    },

    openAddSlotModal(hall: Hall, day: { index: number, date: Dayjs }, time?: Dayjs, allTracks?: boolean) {
      this.slotModalDay = day;
      this.slotModalTime = time;
      if (allTracks) {
        this.slotModalHalls = Array.from(this.availableHalls)
      } else {
        this.slotModalHalls = [hall]
      }

      this.slotModal = true;
    },

    openTemplateModal(hall: Hall, day: { index: number, date: Dayjs }) {
      this.templateModalHall = hall;
      this.templateModalDay = day;

      this.templateModal = true;
    },

    emptyTrack(day: number, hallId: number) {
      const tracks = this.slots.get(day);
    
      if (tracks == undefined) {
        // Should not be able to remove slots from an empty one
        return;
      }
    
      const slots = Array.from(tracks.entries()).find(entry => entry[0].id === hallId)?.[1];
    
      if (slots == undefined) {
        return;
      }
    
      const slotsCount = { total: slots.length, resolved: 0 }
      slots.forEach(s => {
        axios.delete('/konter/slots/' + s.id).then(() => {
          slotsCount.resolved++;
          if (slotsCount.total === slotsCount.resolved) {
            this.loadSlots()
          }
        })
      })
    },

    async editSlot(slot: Slot | undefined) {
      if (slot == undefined) {
        return;
      }

      if (slot.halls.length == 0) {
        await axios.get('/konter/slots/' + slot.id).then((response) => {
          slot = response.data as Slot
          if (response.data.session != undefined) {
            slot.session = sessionDTOToSession(response.data.session as SessionDTO)
          }
          if (response.data.manualSession != undefined) {
            slot.manualSession = manualSessionDTOToManualSession(response.data.manualSession as ManualSessionDTO)
          }
        })
      }

      this.editSlotValue = slot;
      if ((slot.manualSession != undefined || slot.session != undefined) || this.editable) {
      this.editSlotModal = true;
      }
    },

    exportPdf() {
      axios.get("/konter/slots/program/" + this.$route.params.eventId, { responseType: "blob" })
      .then((response) => 
        downloadPdfWithName(response, `program_${this.event.name}.pdf`)
      )
    },

    exportTalks() {
      axios.get("konter/slots/talks/" + this.$route.params.eventId, { responseType: "blob" })
      .then((response) => 
        downloadFileWithNameAndType(response, 'talks.json', 'application/json'))
    }
  }
})
</script>

<style scoped>
.empty-row:hover {
  cursor: pointer;
  background-color: lightblue;
  font-weight: bold;
}

.empty-row:hover::before {
  content: "Add slot at ";
}
</style>