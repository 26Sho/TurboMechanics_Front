// ─── Enums ────────────────────────────────────────────────────────────────────

export type LevelFuel = 'VACIO' | 'UN_CUARTO' | 'MITAD' | 'TRES_CUARTOS' | 'LLENO';
export type StateCondition = 'SIN_NOVEDAD' | 'LEVE' | 'MODERADO' | 'SEVERO';
export type StateOrder = 'RECIBIDO' | 'EN_DIAGNOSTICO' | 'EN_REPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
export type Priority = 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';

// ─── Request ──────────────────────────────────────────────────────────────────

export interface WorkOrderRequest {
  clientname: string;
  clientidentification: string;
  clientphone: string;
  vehicleplate: string;
  vehiclebrand: string;
  vehiclemodel: string;
  vehicleyear: number;
  vehiclecolor?: string;
  failuresreported: string;
  dateestimateddelivery?: string;   // LocalDate → 'YYYY-MM-DD'
  levelfuel?: LevelFuel;
  statescratches?: StateCondition;
  statedents?: StateCondition;
  accessoriesobservations?: string;
  priority?: Priority;
  createdBy?: string;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface WorkOrderResponse {
  id: number;
  numberorder: string;
  clientname: string;
  clientidentification: string;
  clientphone: string;
  vehicleplate: string;
  vehiclebrand: string;
  vehiclemodel: string;
  vehicleyear: number;
  vehiclecolor?: string;
  failuresreported: string;
  dateentry: string;                // LocalDateTime
  dateestimateddelivery?: string;   // LocalDate
  levelfuel?: LevelFuel;
  statescratches?: StateCondition;
  statedents?: StateCondition;
  accessoriesobservations?: string;
  stateorder: StateOrder;
  priority: Priority;
  createdBy?: string;
  datecreation: string;             // LocalDateTime
  // HU 6.7 — mecánico asignado
  assignedMechanicName?: string | null;
  assignedMechanicDocument?: number | null;
}

// ─── HU 6.7 — Disponibilidad de mecánicos ────────────────────────────────────

export interface MechanicAvailabilityDTO {
  id: number;
  name: string;
  document: number;
  position: string;
  laborStatus: string;
  maxOrderCapacity: number;
  currentOrderCount: number;   // órdenes activas actualmente asignadas
  available: boolean;          // true si currentOrderCount < maxOrderCapacity
}

export interface AssignMechanicRequest {
  mechanicDocument: number;
}

// ─── Update Request ────────────────────────────────────────────────────────────
 
export interface WorkOrderUpdateRequest {
  clientname: string;
  clientidentification: string;
  clientphone: string;
  vehicleplate: string;
  vehiclebrand: string;
  vehiclemodel: string;
  vehicleyear: number;
  vehiclecolor?: string;
  failuresreported: string;
  dateestimateddelivery?: string;
  levelfuel?: LevelFuel;
  statescratches?: StateCondition;
  statedents?: StateCondition;
  accessoriesobservations?: string;
  priority?: Priority;
}