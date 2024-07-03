import AttendeeView from '@/views/AttendeeView.vue';
import EventView from '@/views/EventView.vue';
import ParticipantView from '@/views/ParticipantView.vue'
import ProgramView from '@/views/ProgramView.vue';
import RegisteredView from '@/views/RegisteredView.vue'
import SessionView from '@/views/SessionView.vue';
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/registered' },
    {
      path: '/registered',
      name: 'registered',
      component: RegisteredView
    },{
      path: '/participants',
      name: 'persons',
      component: ParticipantView
    },{
      path: '/attendees',
      name: 'attendees',
      component: AttendeeView
    },
    {
      path: '/sessions',
      name: 'sessions',
      component: SessionView
    },
    {
      path: '/events',
      name: 'events',
      component: EventView
    },
    {
      path: '/events/program/:eventId',
      name: 'program',
      component: ProgramView
    }
  ]
})

export default router
