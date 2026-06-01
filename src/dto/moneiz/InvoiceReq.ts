import type { InvoiceId } from './InvoiceId';
import type { InvoiceType } from './InvoiceType';

export type InvoiceReq = {
  reference: InvoiceId;
  /** yyyy-MM-dd */
  creationDate: string;
  buyer: InvoiceBuyerReq;
  location: string;
  purchaseOrderReference?: string;
  service?: string;
  lines: InvoiceLineReq[];
  type: InvoiceType;
};

export type InvoiceBuyerReq = {
  name: string;
  address: string;
  vatId?: string;
  siret: string;
};

export type InvoiceLineReq = {
  description: string;
  amount: number;
};
