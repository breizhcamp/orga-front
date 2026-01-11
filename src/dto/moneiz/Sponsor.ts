export type Sponsor = {
  name: string;
  token: string;
  url?: string;
  logo?: string;
};

export function newSponsor() {
  return {
    name: '',
    token: '',
    url: undefined,
    logo: undefined,
  }
}
