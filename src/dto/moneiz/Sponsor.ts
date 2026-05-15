export type Sponsor = {
  name: string;
  token: string;
  url?: string;
  logo?: string;
  invoiceName?: string;
  address?: string;
  vatId?: string;
  siret?: string;
};

export function newSponsor(): Sponsor {
  return {
    name: '',
    token: '',
    url: undefined,
    logo: undefined,
  };
}
