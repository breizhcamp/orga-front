import type { InvoiceState } from './InvoiceState';

export type UpdateInvoiceReq = {
  invoiceState: InvoiceState;
  paymentDate: string | undefined;
};
