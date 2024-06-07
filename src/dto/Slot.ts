import type { Hall } from "./Hall"
import type { Session, ManualSession } from "./Session"

export interface Slot {
  id: string

  day: number
  session?: Session
  manualSession?: ManualSession
  halls: Array<Hall>
  start: string
  duration: string
  barcode?: string
  span: number
}