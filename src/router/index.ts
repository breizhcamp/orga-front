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
    component: DashboardView,
    meta: { title: 'Home' }
  },{
    path: '/events',
    children: [{
      path: '',
      name: 'Liste des évènements',
      component: ListEventView,
      meta: { title: 'Liste des évènements' }
    },{
      path: '/events/:eventId',
      name: 'Ajout/modif d\'un évènement',
      component: EditEventView,
      meta: { title: 'Ajout/modif d\'un évènement' }
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
        component: SponsoringsView,
        meta: { title: 'Sponsorings' }
      },{
        path: 'sponsors',
        name: 'Sponsors',
        component: SponsorsView,
        meta: { title: 'Sponsors' }
      },{
        path: 'sponsors/:sponsorId',
        name: 'SponsorEdit',
        component: SponsorEditView,
        meta: { title: 'Ajout/modif d\'un sponsor' }
      }
    ]
  }
];

const initRouter = () => {
  const history = createWebHashHistory(import.meta.env.BASE_URL)
  const router = createRouter({ history, routes });

  router.beforeEach((to, _, next) => {
    // Cherche un titre dans la route active, ou à défaut sur la route appariée la plus profonde
    const metaTitle = to.meta.title ?? [...to.matched].reverse().find(r => r.meta?.title)?.meta?.title;
    const resolvedTitle = typeof metaTitle === 'function' ? metaTitle(to) : metaTitle;
    document.title = resolvedTitle ? `${resolvedTitle} - BreizhCamp` : 'BreizhCamp'
    next()
  })

  return router
}

export { initRouter }
