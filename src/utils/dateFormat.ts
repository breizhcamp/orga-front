import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(weekday)
dayjs.extend(localizedFormat)

function formatDay(dateStr: string): string {
  const d = dayjs(dateStr)
  return `${d.format('ddd')} ${d.format('D')}`
}

function formatMonthYear(dateStr: string): string {
  const d = dayjs(dateStr)
  return `${d.format('MMMM')} ${d.format('YYYY')}`
}

/**
 * Formats a date range in French with appropriate formatting based on whether
 * the dates share the same month/year.
 *
 * @param startDate - ISO format date string (e.g., "2025-05-15")
 * @param endDate - ISO format date string (e.g., "2025-05-17")
 * @returns Formatted date range string (e.g., "du mercredi 15 au vendredi 17 mai 2025")
 *          or empty string if dates are not provided
 */
export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return ''

  const s = dayjs(startDate)
  const e = dayjs(endDate)
  const sameMonth = s.month() === e.month() && s.year() === e.year()
  const sameYear = s.year() === e.year()

  if (sameMonth) {
    return `du ${formatDay(startDate)} au ${formatDay(endDate)} ${formatMonthYear(endDate)}`
  }

  if (sameYear) {
    return `du ${formatDay(startDate)} ${dayjs(startDate).format('MMMM')} au ${formatDay(endDate)} ${formatMonthYear(endDate)}`
  }

  return `du ${formatDay(startDate)} ${formatMonthYear(startDate)} au ${formatDay(endDate)} ${formatMonthYear(endDate)}`
}
