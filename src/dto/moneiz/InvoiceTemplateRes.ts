import type { InvoiceReference } from './InvoiceReference';

export type InvoiceTemplateRes = {
  reference: InvoiceReference;
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
