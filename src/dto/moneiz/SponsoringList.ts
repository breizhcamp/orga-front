export type SponsoringId = string;

export type SponsoringList = {
  id: SponsoringId;

  levelName: string;
  sponsor: SponsoringSponsorList;
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

export enum AgreementState {
  TODO = 'TODO',
  TO_SEND = 'TO_SEND',
  MAIL_SENT = 'MAIL_SENT',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  SIGNED = 'SIGNED',
}

export enum InvoiceState {
  TODO = 'TODO',
  ORDER_FORM = 'ORDER_FORM',
  TO_SEND = 'TO_SEND',
  SENT = 'SENT',
  REMINDED = 'REMINDED',
  PAYED = 'PAYED',
  REFUNDED = 'REFUNDED',
}

export enum TicketsState {
  TODO = 'TODO',
  GENERATED = 'GENERATED',
  SENT = 'SENT',
}
