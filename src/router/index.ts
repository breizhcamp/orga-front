import AttendeeView from '@/views/AttendeeView.vue';
import DashboardView from '@/views/events/DashboardView.vue';
import EditEventView from '@/views/events/EditEventView.vue';
import MoneizView from '@/views/moneiz/MoneizView.vue';
import SponsoringsView from '@/views/moneiz/SponsoringsView.vue';
import SponsorsView from '@/views/moneiz/SponsorsView.vue';
import ParticipantView from '@/views/ParticipantView.vue'
import RegisteredView from '@/views/RegisteredView.vue'
import SessionView from '@/views/SessionView.vue';
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: DashboardView
  },{
    path: '/events/:eventId',
    name: 'Edit event',
    component: EditEventView
  },{
    path: '/registered',
    name: 'Registered',
    component: RegisteredView
  },{
    path: '/participants',
    name: 'Participants',
    component: ParticipantView
  },{
    path: '/attendees',
    name: 'Attendees',
    component: AttendeeView
  },{
    path: '/sessions',
    name: 'Sessions',
    component: SessionView
  },{
    path: '/moneiz',
    name: 'Moneiz',
    component: MoneizView,
    redirect: '/moneiz/sponsorings',
    children: [
      {
        path: 'sponsorings',
        name: 'MoneizSponsorings',
        component: SponsoringsView
      },{
        path: 'sponsors',
        name: 'MoneizSponsors',
        component: SponsorsView
      }
    ]
  }
];

const initRouter = () => {
  const history = createWebHashHistory(import.meta.env.BASE_URL)
  const router = createRouter({ history, routes });

  router.beforeEach((to, _, next) => {
    document.title = `${to.name?.toString()} - BreizhCamp`
    next()
  })

  return router
}

export { initRouter }
