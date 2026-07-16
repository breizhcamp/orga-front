export type SponsorApplicationId = string;

export type SponsorApplicationRes = {
  id: SponsorApplicationId;
  companyName: string;
  contact: SponsorApplicationContactRes;
  sponsoringLevel: string;
  additionalInformations?: string;
};

export type SponsorApplicationContactId = string;

export type SponsorApplicationContactRes = {
  id: SponsorApplicationContactId;
  firstname?: string;
  lastname: string;
  email: string;
};
