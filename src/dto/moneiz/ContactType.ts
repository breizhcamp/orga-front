export const CONTACT_TYPES = [
  'PRINCIPAL',
  'INVOICE',
  'COMMUNICATION',
  'TICKETS',
] as const;

export type ContactType = typeof CONTACT_TYPES[number];
