<template>
  <ToolBar title="Participants" :actions="actions" />

  <div class="mb-3 main-content">
    <ParticipantsFilter :filter="filter" @filter="(f) => load(f)"/>

    <table class="table table-striped table-hover">
      <thead>
      <tr>
        <th scope="col"><input type="checkbox" v-model="allChecked"></th>
        <th scope="col">Lastname</th>
        <th scope="col">Firstname</th>
        <th scope="col">Email</th>
        <th scope="col">Telephone</th>
        <th scope="col">Pass</th>
        <th scope="col">Or.</th>
        <th scope="col">Limit date</th>
        <th scope="col"></th>
      </tr>
      </thead>
      <tbody>
      <tr 
        v-for="p in participants" 
        :key="p.id" 
        @click.exact="p.checked = !p.checked" 
        @click.shift="checkBetween(p)"
      >
        <td><input type="checkbox" v-model="p.checked"></td>
        <td>{{ p.lastname }}</td>
        <td>{{ p.firstname }}</td>
        <td>{{ p.email }}</td>
        <td>{{ p.telephone }}</td>
        <td><PassSlot :pass="p.pass"/></td>
        <td>{{ p.drawOrder }}</td>
        <td>
          <DateView 
            :date="p.confirmationLimitDate" 
            format="DD/MM HH:mm" 
            sup=""
          />
        </td>
        <td>
          <button 
            type="button" 
            class="btn btn-link btn-sm" 
            title="Notify success" 
            @click="notifyOne(p.id, 'success')" 
            :disabled="loading"
          >
            <BiSendCheck/>
          </button>
          <button 
            type="button" 
            class="btn btn-link btn-sm" 
            title="Notify waiting" 
            @click="notifyOne(p.id, 'waiting')" 
            :disabled="loading"
          >
            <BiSendExclamation/>
          </button>
          <button 
            type="button" 
            class="btn btn-link btn-sm" 
            title="Notify failed" 
            @click="notifyOne(p.id, 'failed')" 
            :disabled="loading"
          > 
            <BiSendX/>
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <nav class="navbar sticky-bottom bg-light">
      <div class="container-fluid">
        <div>
          <button 
            type="button" 
            class="btn btn-primary me-1" 
            @click="notifySel('success')" 
            :disabled="loading"
          >
            <BiSendCheck/> Notify success
          </button>
          <button 
            type="button" 
            class="btn btn-warning me-1" 
            @click="notifySel('waiting')" 
            :disabled="loading"
          >
            <BiSendExclamation/> Notify waiting
          </button>
          <button 
            type="button" 
            class="btn btn-outline-danger me-4" 
            @click="notifySel('failed')" 
            :disabled="loading"
          >
            <BiSendX/> Notify failed
          </button>

          <button 
            type="button" 
            class="btn btn-outline-primary me-4" 
            @click="notifySel('success/reminder')" 
            :disabled="loading"
          >
            <BiSendCheck/> Remind success
          </button>

          <button 
            type="button" 
            class="btn btn-outline-primary me-1" 
            @click="levelUp('attendee')" 
            :disabled="loading"
          >
            <BiArrowUp/> Level Up to attendee
          </button>
          <button 
            type="button" 
            class="btn btn-outline-warning me-1" 
            @click="levelUp('release')" 
            :disabled="loading"
          >
            <BiArrowUp/> Level Up to release
          </button>

          <div 
            class="d-inline-block ms-3" 
            v-if="checked.length > 0"
          >
            {{ checked.length }}/{{ participants.length }}
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script lang="ts">
/// <reference types="vite-svg-loader" />

import DateView from '@/components/DateView.vue'
import type { Participant } from '@/dto/Participant'
import axios from 'axios'
import BiSendCheck from 'bootstrap-icons/icons/send-check.svg?component'
import BiSendExclamation from 'bootstrap-icons/icons/send-exclamation.svg?component'
import BiSendX from 'bootstrap-icons/icons/send-x.svg?component'
import BiArrowUp from 'bootstrap-icons/icons/arrow-bar-up.svg?component'
import BiShuffle from 'bootstrap-icons/icons/shuffle.svg?component'
import { defineComponent, shallowRef } from 'vue'
import PassSlot from '@/components/PassSlot.vue'
import ParticipantsFilter from '@/components/ParticipantsFilter.vue'
import type { ParticipantFilter } from '@/dto/ParticipantFilter'
import ToolBar from '@/components/ToolBar.vue'
import type { Action } from '@/dto/Action'

export default defineComponent({
  name: "ParticipantView",
  components: { 
    ToolBar, 
    ParticipantsFilter, 
    PassSlot, 
    DateView, 
    BiSendCheck, 
    BiSendExclamation, 
    BiSendX, 
    BiArrowUp 
  },

  data() {
    return {
      participants: [] as Participant[],
      allChecked: false,
      loading: false,
      filter: {} as ParticipantFilter,
      actions: [] as Action[]
    }
  },

  mounted() {
    this.actions = [
      // @ts-ignore : We pass a shallowRef instead of the component
      { label: "Tirer", title: "Draw", function: this.draw, icon: shallowRef(BiShuffle) }
    ]
  },

  computed: {
    checked(): Participant[] {
      return this.participants.filter((r) => r.checked)
    }
  },

  created() {
    this.$watch(() => this.$route.params, () => this.load(), { immediate: true })
  },

  watch: {
    allChecked() {
      this.participants.forEach((r) => r.checked = this.allChecked)
    }
  },

  methods: {
    checkBetween(p: Participant) {
      const first = this.participants.findIndex((r) => r.checked)
      const clicked = this.participants.findIndex((r) => r.id === p.id)
      if (first === -1) {
        p.checked = !p.checked
      } else {
        const min = Math.min(first, clicked)
        const max = Math.max(first, clicked)
        for (let i = min; i <= max; i++) {
          this.participants[i].checked = !p.checked
        }
      }
    },

    load(filter?: ParticipantFilter) {
      const method = filter ? 'post' : 'get'
      const url = filter ? '/admin/participants/filter' : '/admin/participants'

      axios.request({ method, url, data: filter }).then((response) => {
        this.participants = response.data
      })
    },

    draw() {
      this.loading = true
      axios.post('/admin/participants/draw').then(() => {
        this.load()
      }).finally(() => {
        this.loading = false
      })
    },

    notifyOne(id: string, type: string) {
      this.sendNotify([id], type);
    },

    notifySel(type: string) {
      this.sendNotify(this.getSelected(), type);
    },

    sendNotify(ids: string[], type: string) {
      this.loading = true
      axios.post('/admin/participants/notif/' + type, ids).then(() => {
        this.load()
      }).finally(() => {
        this.loading = false
      })
    },

    notifyAll() {
      this.loading = true
      axios.post('/admin/participants/notif').then(() => {
        this.load()
      }).finally(() => {
        this.loading = false
      })
    },

    levelUp(level: string) {
      this.loading = true
      const ids = this.getSelected()
      axios.post('/admin/participants/levelUp/' + level, ids).then(() => {
        this.load()
      }).finally(() => {
        this.loading = false
      })
    },

    getSelected: function () {
      return this.participants.filter((p) => p.checked).map((p) => p.id)
    },
  }
})
</script>
