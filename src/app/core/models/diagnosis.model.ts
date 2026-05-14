export type UrgencyLevel = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export interface DiagnosisRequest {
  workOrderId: number;
  detectedfailures: string;
  mechanicobservations: string;
  urgencylevel: UrgencyLevel;
  registeredby?: string;
}

export interface DiagnosisResponse {
  id: number;
  workOrderId: number;
  workOrderNumber: string;
  vehicleplate: string;
  detectedfailures: string;
  mechanicobservations: string;
  urgencylevel: UrgencyLevel;
  ordergenerated: boolean;
  registeredby?: string;
  registrationdate: string;
  updatedate?: string;
}