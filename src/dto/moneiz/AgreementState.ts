export enum AgreementState {
  TODO = 'TODO',
  TO_SEND = 'TO_SEND',
  MAIL_SENT = 'MAIL_SENT',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  SIGNED = 'SIGNED',
}

export const agreementStateToString = {
  [AgreementState.TODO]: 'à faire',
  [AgreementState.TO_SEND]: 'à envoyer',
  [AgreementState.MAIL_SENT]: 'mail envoyé',
  [AgreementState.SENT]: 'envoyée',
  [AgreementState.RECEIVED]: 'reçue',
  [AgreementState.SIGNED]: 'signée',
} as const satisfies Record<AgreementState, string>;

export const agreementStateColors = {
  [AgreementState.TODO]: 'secondary',
  [AgreementState.TO_SEND]: 'warning',
  [AgreementState.MAIL_SENT]: 'info',
  [AgreementState.SENT]: 'info',
  [AgreementState.RECEIVED]: 'primary',
  [AgreementState.SIGNED]: 'success',
} as const satisfies Record<AgreementState, string>;
