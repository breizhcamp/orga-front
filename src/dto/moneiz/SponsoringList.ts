
export type SponsoringId = string

export type SponsoringList = {
  id: SponsoringId

  levelName: string
  sponsor: SponsoringSponsorList
  agreementState: string | undefined
}

export type SponsoringSponsorList = {
  id: string
  name: string
}
