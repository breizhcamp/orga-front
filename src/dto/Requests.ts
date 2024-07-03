export interface SlotPatchReq {
  title?: string
  assignable: boolean
}

export interface SlotCreationReq {
  start: string
  day: number
  duration: string
  title?: string
  hallIds: number[]
  assignable: boolean
}