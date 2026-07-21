import type { SponsorId } from '@/dto/moneiz/SponsorList';

export type ConvertSponsorApplicationReq = {
  sponsoringLevel: string;
  sponsor?: SponsorId;
};
