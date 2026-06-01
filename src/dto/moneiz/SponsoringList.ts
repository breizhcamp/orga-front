import type { AgreementState } from './AgreementState';
import type { InvoiceState } from './InvoiceState';
import type { TicketsState } from './TicketsState';

export type SponsoringId = string;

export type SponsoringList = {
  id: SponsoringId;

  levelName: string;
  sponsor?: SponsoringSponsorList;
  agreementState: AgreementState | undefined;

  nbPresales: number | undefined;

  invoiceState: InvoiceState | undefined;
  invoiceNumber: string | undefined;
  invoicePaymentDate: string | undefined; // As ISO Date YYYY-MM-DD

  standNumber: string | undefined;

  ticketsState: TicketsState | undefined;
};

export type SponsoringSponsorList = {
  id: string;
  name: string;
};
