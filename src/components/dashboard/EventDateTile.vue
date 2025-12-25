<template>
  <div class="card h-100 tile" :class="variantClass">
    <div class="card-body">
      <div class="d-flex align-items-center mb-2">
        <div class="tile-icon me-2" aria-hidden="true">📅</div>
        <h5 class="card-title mb-0">Dates</h5>
      </div>
      <p class="card-text mb-0" v-if="startDate && endDate">
        {{ formattedRange }}
      </p>
      <p class="card-text mb-0" v-else>
        <i>Non défini</i>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { computed } from 'vue'

dayjs.extend(weekday)
dayjs.extend(localizedFormat)

const props = defineProps<{ startDate?: string; endDate?: string; variant?: 'primary' | 'success' | 'info' | 'warning' | 'danger' }>()

function formatDay(dateStr: string): string {
  const d = dayjs(dateStr)
  return `${d.format('dddd')} ${d.format('D')}`
}
function formatMonthYear(dateStr: string): string {
  const d = dayjs(dateStr)
  return `${d.format('MMMM')} ${d.format('YYYY')}`
}

const formattedRange = computed(() => {
  if (!props.startDate || !props.endDate) return ''
  const s = dayjs(props.startDate)
  const e = dayjs(props.endDate)
  const sameMonth = s.month() === e.month() && s.year() === e.year()
  const sameYear = s.year() === e.year()
  if (sameMonth) {
    return `du ${formatDay(props.startDate)} au ${formatDay(props.endDate)} ${formatMonthYear(props.endDate)}`
  }
  if (sameYear) {
    return `du ${formatDay(props.startDate)} ${dayjs(props.startDate).format('MMMM')} au ${formatDay(props.endDate)} ${formatMonthYear(props.endDate)}`
  }
  return `du ${formatDay(props.startDate)} ${formatMonthYear(props.startDate)} au ${formatDay(props.endDate)} ${formatMonthYear(props.endDate)}`
})

const variantClass = computed(() => props.variant ? `tile-${props.variant}` : 'tile-default')
</script>

<style scoped>
.card-title { font-weight: 600; }
.tile { border: 0; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.tile-default { background: #ffffff; }
.tile-primary { background: #e8f0ff; }
.tile-success { background: #e9f7ef; }
.tile-info { background: #e7f5ff; }
.tile-warning { background: #fff4e6; }
.tile-danger { background: #fdecea; }
.tile-icon { font-size: 1.1rem; }
</style>
