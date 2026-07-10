import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

import { useEventStore } from '@/stores/event';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Home' },
  }, {
    path: '/events',
    children: [{
      path: '',
      name: 'ListEvent',
      component: () => import('@/views/events/ListEventView.vue'),
      meta: { title: 'Liste des évènements' },
    }, {
      path: '/events/:eventId',
      name: 'EditEvent',
      component: () => import('@/views/events/EditEventView.vue'),
      meta: { title: 'Ajout/modif d\'un évènement' },
    }],
  }, {
    path: '/moneiz',
    name: 'Moneiz',
    component: () => import('@/views/moneiz/MoneizView.vue'),
    redirect: '/moneiz/sponsorings',
    children: [
      {
        path: 'sponsorings',
        name: 'Sponsorings',
        component: () => import('@/views/moneiz/SponsoringsView.vue'),
        meta: { title: 'Sponsorings' },
      }, {
        path: 'sponsorings/new',
        name: 'SponsoringsCreate',
        component: () => import('@/views/moneiz/SponsoringsCreateView.vue'),
        beforeEnter: () => {
          const eventStore = useEventStore();
          if (eventStore.currentEventId === undefined) {
            return { name: 'ListEvent' };
          }
        },
        meta: { title: 'Création de sponsorings' },
      }, {
        path: 'sponsorings/:sponsoringId',
        name: 'SponsoringDetails',
        component: () => import('@/views/moneiz/SponsoringDetailsView.vue'),
        meta: { title: 'Détails sponsorings' },
      }, {
        path: 'sponsorings/:sponsoringId/agreement',
        name: 'SponsoringAgreement',
        component: () => import('@/views/moneiz/SponsoringAgreementView.vue'),
        meta: { title: 'Convention' },
      }, {
        path: 'sponsorings/:sponsoringId/invoice',
        name: 'SponsoringInvoice',
        component: () => import('@/views/moneiz/SponsoringInvoiceView.vue'),
        meta: { title: 'Facture' },
      }, {
        path: 'sponsorings/:sponsoringId/stand',
        name: 'SponsoringStand',
        component: () => import('@/views/moneiz/SponsoringStandView.vue'),
        meta: { title: 'Stand' },
      }, {
        path: 'sponsors',
        name: 'Sponsors',
        component: () => import('@/views/moneiz/SponsorsView.vue'),
        meta: { title: 'Sponsors' },
      }, {
        path: 'sponsors/:sponsorId',
        name: 'SponsorEdit',
        component: () => import('@/views/moneiz/SponsorEditView.vue'),
        meta: { title: 'Ajout/modif d\'un sponsor' },
      },
    ],
  },
];

const initRouter = () => {
  const history = createWebHashHistory(import.meta.env.BASE_URL);
  const router = createRouter({ history, routes });

  router.beforeEach((to, _, next) => {
    // Cherche un titre dans la route active, ou à défaut sur la route appariée la plus profonde
    const metaTitle = to.meta.title ?? [...to.matched].reverse().find(r => r.meta.title)?.meta.title;
    const resolvedTitle = typeof metaTitle === 'function' ? metaTitle(to) : metaTitle;
    document.title = resolvedTitle ? `${resolvedTitle} - BreizhCamp` : 'BreizhCamp';
    next();
  });

  return router;
};

export { initRouter };
