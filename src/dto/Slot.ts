import type { Hall } from "./Hall"
import type { Session } from "./Session"

export interface Slot {
  id: string

  day: number
  session?: Session
  hall?: Hall
  start: string
  duration: string
  barcode?: string
  span: number
}