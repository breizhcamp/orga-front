export interface Team {
  id: string,

  name: string,
  description: string,

  participations: TeamParticipations | Array<{ memberId: string, eventId: number }>
}

export class TeamParticipations {
  values: Array<{ memberId: string, eventId: number }>

  constructor(vals: Array<{ memberId: string, eventId: number }>) {
    this.values = vals
  }

  getMemberIds(eventId: number): Array<string> {
    return this.values
      .filter(entry => entry.eventId === eventId)
      .map(entry => entry.memberId)
  }
}