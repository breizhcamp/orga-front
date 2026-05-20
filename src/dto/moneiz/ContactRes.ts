import type { ContactType } from './ContactType';

export type ContactRes = {
  id: number;
  firstname?: string;
  lastname: string;
  email: string;
  type: ContactType[];
};
