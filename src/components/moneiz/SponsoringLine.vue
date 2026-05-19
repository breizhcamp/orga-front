<script setup lang="ts">
import BiBoxArrowUpRight from 'bootstrap-icons/icons/box-arrow-up-right.svg?component';
import dayjs from 'dayjs';

import type { LevelList } from '@/dto/moneiz/LevelList.ts';
import type { SponsoringList } from '@/dto/moneiz/SponsoringList.ts';

defineProps<{
  sponsoring: SponsoringList;
  level: LevelList | undefined;
}>();

function formatDate(date: string | undefined): string {
  if (!date) return '';
  return dayjs(date).format('L');
}

function getStateClass(state: string | undefined): string {
  if (!state) return 'badge-secondary';

  switch (state) {
    case 'TODO':
      return 'badge-secondary';
    case 'TO_SEND':
    case 'GENERATED':
      return 'badge-warning';
    case 'MAIL_SENT':
    case 'SENT':
      return 'badge-info';
    case 'RECEIVED':
    case 'PAYED':
      return 'badge-success';
    case 'SIGNED':
      return 'badge-dark-success';
    case 'REMINDED':
      return 'badge-orange';
    case 'ORDER_FORM':
      return 'badge-light';
    case 'REFUNDED':
      return 'badge-danger';
    default:
      return 'badge-secondary';
  }
}
</script>

<template>
  <div class="sponsoring-line">
    <!-- Level Badge -->
    <div class="level-badge" :style="{ backgroundColor: level?.color || '#cccccc' }">
      {{ sponsoring.levelName.charAt(0).toUpperCase() }}
    </div>

    <!-- Sponsor Name -->
    <div class="sponsor-name">
      <router-link
        :to="{ name: 'SponsorEdit', params: { sponsorId: sponsoring.sponsor.id } }"
        class="sponsor-link"
      >
        {{ sponsoring.sponsor.name }}
      </router-link>
    </div>

    <!-- Agreement -->
    <div class="agreement-section">
      <span class="mobile-label">Agreement:</span>
      <div class="content">
        <span v-if="sponsoring.agreementState" :class="['badge', getStateClass(sponsoring.agreementState)]">
          {{ sponsoring.agreementState }}
        </span>
        <span v-if="sponsoring.nbPresales !== undefined" class="presales">
          ({{ sponsoring.nbPresales }} presales)
        </span>
        <a href="#" class="action-link" title="View agreement">
          <BiBoxArrowUpRight />
        </a>
      </div>
    </div>

    <!-- Invoice -->
    <div class="invoice-section">
      <span class="mobile-label">Invoice:</span>
      <div class="content">
        <span v-if="sponsoring.invoiceState" :class="['badge', getStateClass(sponsoring.invoiceState)]">
          {{ sponsoring.invoiceState }}
        </span>
        <span v-if="sponsoring.invoiceNumber" class="invoice-number">
          {{ sponsoring.invoiceNumber }}
        </span>
        <span v-if="sponsoring.invoicePaymentDate" class="payment-date">
          {{ formatDate(sponsoring.invoicePaymentDate) }}
        </span>
        <a href="#" class="action-link" title="View invoice">
          <BiBoxArrowUpRight />
        </a>
      </div>
    </div>

    <!-- Stand -->
    <div class="stand-section">
      <span class="mobile-label">Stand:</span>
      <div class="content">
        <span v-if="sponsoring.standNumber" class="stand-number">
          {{ sponsoring.standNumber }}
        </span>
        <span v-else class="text-muted">-</span>
        <a href="#" class="action-link" title="View stand">
          <BiBoxArrowUpRight />
        </a>
      </div>
    </div>

    <!-- Tickets -->
    <div class="tickets-section">
      <span class="mobile-label">Tickets:</span>
      <div class="content">
        <span v-if="sponsoring.ticketsState" :class="['badge', getStateClass(sponsoring.ticketsState)]">
          {{ sponsoring.ticketsState }}
        </span>
        <a href="#" class="action-link" title="View tickets">
          <BiBoxArrowUpRight />
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sponsoring-line {
  display: grid;
  grid-template-columns: 40px 1fr 180px 200px 100px 120px;
  gap: 8px;
  align-items: center;
  min-height: 30px;
  padding: 4px 8px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #ffffff;
  transition: background-color 0.2s;
}

.sponsoring-line:nth-child(even) {
  background-color: #f8f9fa;
}

.sponsoring-line:hover {
  background-color: #e9ecef;
}

@media (prefers-color-scheme: dark) {
  .sponsoring-line {
    border-bottom-color: #444;
    background-color: #212529;
  }

  .sponsoring-line:nth-child(even) {
    background-color: #2c3034;
  }

  .sponsoring-line:hover {
    background-color: #3a3f44;
  }
}

.level-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.sponsor-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sponsor-link {
  color: #0d6efd;
  text-decoration: none;
  font-weight: 500;
}

.sponsor-link:hover {
  text-decoration: underline;
}

@media (prefers-color-scheme: dark) {
  .sponsor-link {
    color: #6ea8fe;
  }
}

.mobile-label {
  display: none;
  font-weight: 600;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

@media (prefers-color-scheme: dark) {
  .mobile-label {
    color: #adb5bd;
  }
}

.content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-secondary {
  background-color: #6c757d;
  color: white;
}

.badge-warning {
  background-color: #ffc107;
  color: #000;
}

.badge-info {
  background-color: #0dcaf0;
  color: #000;
}

.badge-success {
  background-color: #198754;
  color: white;
}

.badge-dark-success {
  background-color: #0d4b2e;
  color: white;
}

.badge-orange {
  background-color: #fd7e14;
  color: white;
}

.badge-light {
  background-color: #f8f9fa;
  color: #000;
  border: 1px solid #dee2e6;
}

@media (prefers-color-scheme: dark) {
  .badge-light {
    background-color: #495057;
    color: #f8f9fa;
    border-color: #6c757d;
  }
}

.badge-danger {
  background-color: #dc3545;
  color: white;
}

.presales,
.invoice-number,
.payment-date,
.stand-number {
  font-size: 13px;
  color: #495057;
}

@media (prefers-color-scheme: dark) {
  .presales,
  .invoice-number,
  .payment-date,
  .stand-number {
    color: #adb5bd;
  }
}

.text-muted {
  color: #6c757d;
  font-size: 13px;
}

@media (prefers-color-scheme: dark) {
  .text-muted {
    color: #6c757d;
  }
}

.action-link {
  color: #6c757d;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  margin-left: auto;
}

.action-link:hover {
  color: #0d6efd;
}

@media (prefers-color-scheme: dark) {
  .action-link {
    color: #adb5bd;
  }

  .action-link:hover {
    color: #6ea8fe;
  }
}

.action-link svg {
  width: 14px;
  height: 14px;
}

/* Mobile responsive design */
@media (max-width: 767.98px) {
  .sponsoring-line {
    grid-template-columns: 1fr;
    gap: 12px;
    min-height: auto;
    padding: 16px;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    margin-bottom: 12px;
  }

  @media (prefers-color-scheme: dark) {
    .sponsoring-line {
      border-color: #495057;
    }
  }

  .level-badge {
    width: 48px;
    height: 48px;
    font-size: 18px;
    grid-row: 1;
    justify-self: start;
  }

  .sponsor-name {
    grid-row: 1;
    padding-left: 60px;
    font-size: 16px;
    white-space: normal;
  }

  .mobile-label {
    display: block;
  }

  .agreement-section,
  .invoice-section,
  .stand-section,
  .tickets-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .content {
    width: 100%;
    flex-wrap: wrap;
  }

  .action-link {
    margin-left: 0;
  }

  .badge {
    font-size: 12px;
    padding: 4px 10px;
  }

  .presales,
  .invoice-number,
  .payment-date,
  .stand-number {
    font-size: 14px;
  }
}
</style>
