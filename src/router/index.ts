import DashboardView from '@/views/DashboardView.vue';
import EditEventView from '@/views/events/EditEventView.vue';
import ListEventView from '@/views/events/ListEventView.vue';
import MoneizView from '@/views/moneiz/MoneizView.vue';
import SponsorEditView from '@/views/moneiz/SponsorEditView.vue';
import SponsoringsView from '@/views/moneiz/SponsoringsView.vue';
import SponsorsView from '@/views/moneiz/SponsorsView.vue';
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: DashboardView
  },{
    path: '/events',
    children: [{
      path: '',
      name: 'Liste des évènements',
      component: ListEventView,
    },{
      path: '/events/:eventId',
      name: 'Ajout/modif d\'un évènement',
      component: EditEventView
    }]
  },{
    path: '/moneiz',
    name: 'Moneiz',
    component: MoneizView,
    redirect: '/moneiz/sponsorings',
    children: [
      {
        path: 'sponsorings',
        name: 'Sponsorings',
        component: SponsoringsView
      },{
        path: 'sponsors',
        name: 'Sponsors',
        component: SponsorsView
      },{
        path: 'sponsors/:sponsorId',
        name: 'Ajout/modif d\'un sponsor',
        component: SponsorEditView
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
