export interface Member {
  id: string

  lastname: string
  firstname: string
  contacts: Array<Contact>
  profilePictureLink?: string
  keycloakId: string

  participations: MemberParticipations | Array<{ teamId: string, eventId: number }>
}

export class MemberParticipations {
  values: Array<{ teamId: string, eventId: number }>;

  constructor(vals: Array<{ teamId: string, eventId: number }>) {
    this.values = vals
  }

  getTeamIds(eventId: number): Array<string> {
    return this.values
      .filter((entry) => entry.eventId === eventId)
      .map((entry) => entry.teamId)
  }
}

export interface Contact {
  id: string

  platform: string
  link: string
  public: boolean
}