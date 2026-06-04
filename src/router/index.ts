import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

import { useEventStore } from '@/stores/event';
import DashboardView from '@/views/DashboardView.vue';
import EditEventView from '@/views/events/EditEventView.vue';
import ListEventView from '@/views/events/ListEventView.vue';
import MoneizView from '@/views/moneiz/MoneizView.vue';
import SponsorEditView from '@/views/moneiz/SponsorEditView.vue';
import SponsoringAgreementView from '@/views/moneiz/SponsoringAgreementView.vue';
import SponsoringDetailsView from '@/views/moneiz/SponsoringDetailsView.vue';
import SponsoringInvoiceView from '@/views/moneiz/SponsoringInvoiceView.vue';
import SponsoringsCreateView from '@/views/moneiz/SponsoringsCreateView.vue';
import SponsoringStandView from '@/views/moneiz/SponsoringStandView.vue';
import SponsoringsView from '@/views/moneiz/SponsoringsView.vue';
import SponsorsView from '@/views/moneiz/SponsorsView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: DashboardView,
    meta: { title: 'Home' },
  }, {
    path: '/events',
    children: [{
      path: '',
      name: 'ListEvent',
      component: ListEventView,
      meta: { title: 'Liste des évènements' },
    }, {
      path: '/events/:eventId',
      name: 'Ajout/modif d\'un évènement',
      component: EditEventView,
      meta: { title: 'Ajout/modif d\'un évènement' },
    }],
  }, {
    path: '/moneiz',
    name: 'Moneiz',
    component: MoneizView,
    redirect: '/moneiz/sponsorings',
    children: [
      {
        path: 'sponsorings',
        name: 'Sponsorings',
        component: SponsoringsView,
        meta: { title: 'Sponsorings' },
      }, {
        path: 'sponsorings/new',
        name: 'SponsoringsCreate',
        component: SponsoringsCreateView,
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
        component: SponsoringDetailsView,
        meta: { title: 'Détails sponsorings' },
      }, {
        path: 'sponsorings/:sponsoringId/agreement',
        name: 'SponsoringAgreement',
        component: SponsoringAgreementView,
        meta: { title: 'Convention' },
      }, {
        path: 'sponsorings/:sponsoringId/invoice',
        name: 'SponsoringInvoice',
        component: SponsoringInvoiceView,
        meta: { title: 'Facture' },
      }, {
        path: 'sponsorings/:sponsoringId/stand',
        name: 'SponsoringStand',
        component: SponsoringStandView,
        meta: { title: 'Stand' },
      }, {
        path: 'sponsors',
        name: 'Sponsors',
        component: SponsorsView,
        meta: { title: 'Sponsors' },
      }, {
        path: 'sponsors/:sponsorId',
        name: 'SponsorEdit',
        component: SponsorEditView,
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
