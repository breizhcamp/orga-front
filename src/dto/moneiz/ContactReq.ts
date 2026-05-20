import type { ContactType } from './ContactType';

export type ContactReq = {
  id?: number;
  firstname?: string;
  lastname: string;
  email: string;
  type: ContactType[];
};
