import type { InvoiceId } from './InvoiceId';

export type InvoiceTemplateRes = {
  reference: InvoiceId;
  location: string;
  invoiceName?: string;
  address?: string;
  vatId?: string;
  siret?: string;
  lines: InvoiceTemplateLineRes[];
};

export type InvoiceTemplateLineRes = {
  description: string;
  amount: number;
};
