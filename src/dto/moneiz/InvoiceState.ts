export enum InvoiceState {
  TODO = 'TODO',
  ORDER_FORM = 'ORDER_FORM',
  TO_SEND = 'TO_SEND',
  SENT = 'SENT',
  REMINDED = 'REMINDED',
  PAYED = 'PAYED',
  REFUNDED = 'REFUNDED',
}

export const invoiceStateToString = {
  [InvoiceState.TODO]: 'à faire',
  [InvoiceState.ORDER_FORM]: 'att. bon comm.',
  [InvoiceState.TO_SEND]: 'à envoyer',
  [InvoiceState.SENT]: 'envoyée',
  [InvoiceState.REMINDED]: 'relancée',
  [InvoiceState.PAYED]: 'payée',
  [InvoiceState.REFUNDED]: 'remboursée',
} as const satisfies Record<InvoiceState, string>;

export const invoiceStateColors = {
  [InvoiceState.TODO]: 'secondary',
  [InvoiceState.ORDER_FORM]: 'purple',
  [InvoiceState.TO_SEND]: 'warning',
  [InvoiceState.SENT]: 'info',
  [InvoiceState.REMINDED]: 'orange',
  [InvoiceState.PAYED]: 'success',
  [InvoiceState.REFUNDED]: 'danger',
} as const satisfies Record<InvoiceState, string>;
