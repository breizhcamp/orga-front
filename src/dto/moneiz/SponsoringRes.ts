import type { AgreementState } from './AgreementState';
import type { InvoiceId } from './InvoiceId';
import type { InvoiceState } from './InvoiceState';
import type { TicketsState } from './TicketsState';

export type SponsoringRes = {
  id: string;
  levelName: string;
  sponsor?: SponsoringSponsorRes;
  agreementState?: AgreementState;
  invoiceId?: InvoiceId;
  invoiceState?: InvoiceState;
  standNumber?: string;
  ticketsState?: TicketsState;
  presale?: number;
};

export type SponsoringSponsorRes = {
  id: string;
  token: string;
  name: string;
  url?: string;
  logo?: string;
  invoiceName?: string;
  address?: string;
  vatId?: string;
  siret?: string;
};
