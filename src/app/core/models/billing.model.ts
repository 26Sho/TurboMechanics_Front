export type StatusBill     = 'Pending' | 'Paid' | 'Annulled';
export type StatusEstimate = 'SENT' | 'APPROVED' | 'REJECTED';
export type MovementType   = 'Input' | 'Output';
export type MovementConcept = 'Buy' | 'Devolutions' | 'Sale' | 'Use';

export interface PayMethod {
  id:          number;
  name:        string;
  description: string;
  active:      boolean;
  configJson?: string;
}

export interface Bill {
  id:        number;
  numBill:   string;
  workOrder: { id: number; numberorder: string };
  users:     { id: number; username: string; identification: number; email: string };
  vehicle:   { plate: string };
  payMethod: PayMethod;
  date:      string;
  subtotal:  number;
  taxes:     number;
  total:     number;
  status:    StatusBill;
  createdBy: string;
}

export interface GenerateBillRequest {
  workOrderID:    number;
  identification: number;
  plate:          string;
  payMethodId:    number;
  createdBy:      string;
  subtotal:       number;
}

export interface MovementPay {
  id:          number;
  type:        MovementType;
  concept:     MovementConcept;
  description: string;
  amount:      number;
  bill?:       { id: number; numBill: string };
  payMethod?:  PayMethod;
  date:        string;
}

export interface RegisterMovementRequest {
  type:                     MovementType;
  concept:                  MovementConcept;
  description?:             string;
  amount:                   number;
  billId?:                  number;
  payMethod?:               number;
  registerByIdentification: number;
}

export interface CashierResponse {
  start:   string;
  end:     string;
  inputs:  number;
  outputs: number;
  balance: number;
}

export interface CreatePaymentRequest {
  billId:                    number;
  paymentMethod?:            string;   // credit_card | debit_card | pse | efecty | bank_transfer
  payerEmail:                string;
  payerFirstName?:           string;
  payerLastName?:            string;
  payerIdentificationNumber?: string;
  payerIdentificationType?:  string;   // CC | NIT | CE
}

export interface CreatePaymentResponse {
  paymentId:         number;
  externalReference: string;
  initPoint:         string;
  preferenceId:      string;
  status:            string;
  publicKey:         string;
}

export interface Payment {
  id:          number;
  mpPaymentId: string | null;
  status:      string;
  billId:      number;
}