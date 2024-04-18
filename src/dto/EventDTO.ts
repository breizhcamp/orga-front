export interface EventDTO {
  id: number

  name?: string
  year: number
  debutEvent?: Date
  finEvent?: Date
  debutCFP?: Date
  finCFP?: Date
  debutInscription?: Date
  finInscription?: Date
  website?: String

  participants: EventParticipants | Array<{ memberId: string, teamId: string}>
}

export interface EventDates {
  debutEvent?: string
  finEvent?: string
  debutCFP?: string
  finCFP?: string
  debutInscription?: string
  finInscription?: string
}

export class EventParticipants {
  values: Array<{ memberId: string, teamId: string }>

  constructor(vals: Array<{ memberId: string, teamId: string }>) {
    this.values = vals
  }

  getMemberIds(): Array<string> {
    return Array.from(
      new Set(this.values.map((entry) => entry.memberId))
    )
  }

  getTeamIds(): Array<string> {
    return Array.from(
      new Set(this.values.map((entry) => entry.teamId))
    )
  }
}