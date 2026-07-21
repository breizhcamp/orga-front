import type { ContactId } from '@/dto/moneiz/ContactId';

import type { ContactType } from './ContactType';

export type ContactReq = {
  id?: ContactId;
  firstname?: string;
  lastname: string;
  email: string;
  type: ContactType[];
};
