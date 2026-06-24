import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface WarrantyRequest {
  workOrderId: number;
  serviceId?: number | null;
  sparePartId?: number | null;
  startDate: string;
  endDate: string;
  observations?: string;
}

export interface CloseWarrantyRequest {
  closureReason: string;
}

export interface Warranty {
  id: number;
  voucherNumber: string;
  workOrderId: number;
  workOrderNumber: string;
  clientName: string;
  clientIdentification: string;
  vehiclePlate: string;
  serviceId: number;
  serviceName: string;
  sparePartId: number;
  sparePartName: string;
  sparePartReference: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVA' | 'VENCIDA' | 'CERRADA';
  observations: string;
  closureReason: string;
  closureDate: string;
  closedBy: string;
  voucherGeneratedAt: string;
  voucherGeneratedBy: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface WarrantyValidation {
  validationId: number;
  warrantyId: number;
  voucherNumber: string;
  clientName: string;
  vehiclePlate: string;
  coverageDescription: string;
  startDate: string;
  endDate: string;
  result: 'VIGENTE' | 'VENCIDA' | 'CERRADA';
  coverageApproved: boolean;
  message: string;
  rejectionReason: string;
  validatedBy: string;
  validatedAt: string;
}

export interface WorkshopRequest {
  name: string;
  address: string;
  city: string;
  state?: string;
  phone?: string;
  email?: string;
  latitude: number;
  longitude: number;
  schedule?: string;
  active?: boolean;
}

export interface Workshop {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  schedule: string;
  active: boolean;
  distanceKm?: number;
}

export interface QualityCheckItemRequest {
  itemId: number;
  verified: boolean;
  observation?: string;
}

export interface QualityCheckRequest {
  workOrderId: number;
  observations?: string;
  items?: QualityCheckItemRequest[];
}

export interface QualityCheckItem {
  id: number;
  serviceName: string;
  serviceId: number;
  verified: boolean;
  observation: string;
  verifiedBy: string;
  verifiedAt: string;
}

export interface QualityCheck {
  id: number;
  workOrderId: number;
  workOrderNumber: string;
  vehiclePlate: string;
  status: 'EN_PROCESO' | 'COMPLETADO' | 'APROBADO' | 'RECHAZADO';
  observations: string;
  items: QualityCheckItem[];
  totalItems: number;
  verifiedItems: number;
  createdBy: string;
  createdAt: string;
  approvedBy: string;
  approvedAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface WorkEvidence {
  id: number;
  workOrderId: number;
  workOrderNumber: string;
  fileName: string;
  evidenceType: 'IMAGEN' | 'VIDEO' | 'DOCUMENTO';
  mimeType: string;
  filePath: string;
  fileSizeBytes: number;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
}

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class GarantiasService {

  private readonly BASE = 'http://localhost:9090';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── Garantías ─────────────────────────────────────────────────────────────

  registerWarranty(data: WarrantyRequest): Observable<Warranty> {
    return this.http.post<Warranty>(`${this.BASE}/garantias`, data, { headers: this.headers() });
  }

  getWarranties(params?: { cliente?: string; vehiculo?: string; servicio?: number; repuesto?: number; buscar?: string }): Observable<Warranty[]> {
    let p = new HttpParams();
    if (params?.buscar)   p = p.set('buscar', params.buscar);
    else if (params?.cliente)   p = p.set('cliente', params.cliente);
    else if (params?.vehiculo)  p = p.set('vehiculo', params.vehiculo);
    else if (params?.servicio)  p = p.set('servicio', params.servicio.toString());
    else if (params?.repuesto)  p = p.set('repuesto', params.repuesto.toString());
    return this.http.get<Warranty[]>(`${this.BASE}/garantias`, { headers: this.headers(), params: p });
  }

  getWarrantyById(id: number): Observable<Warranty> {
    return this.http.get<Warranty>(`${this.BASE}/garantias/${id}`, { headers: this.headers() });
  }

  updateWarranty(id: number, data: WarrantyRequest): Observable<Warranty> {
    return this.http.put<Warranty>(`${this.BASE}/garantias/${id}`, data, { headers: this.headers() });
  }

  closeWarranty(id: number, data: CloseWarrantyRequest): Observable<Warranty> {
    return this.http.patch<Warranty>(`${this.BASE}/garantias/${id}/cerrar`, data, { headers: this.headers() });
  }

  generateVoucher(id: number): Observable<Blob> {
    return this.http.get(`${this.BASE}/garantias/${id}/comprobante`, {
      headers: this.headers(),
      responseType: 'blob'
    });
  }

  getHistory(params: { cliente?: string; vehiculo?: string; buscar?: string }): Observable<Warranty[]> {
    let p = new HttpParams();
    if (params.buscar)  p = p.set('buscar', params.buscar);
    else if (params.cliente)  p = p.set('cliente', params.cliente);
    else if (params.vehiculo) p = p.set('vehiculo', params.vehiculo);
    return this.http.get<Warranty[]>(`${this.BASE}/garantias/historial`, { headers: this.headers(), params: p });
  }

  validateWarranty(id: number): Observable<WarrantyValidation> {
    return this.http.post<WarrantyValidation>(`${this.BASE}/garantias/${id}/validar`, {}, { headers: this.headers() });
  }

  getValidationHistory(id: number): Observable<WarrantyValidation[]> {
    return this.http.get<WarrantyValidation[]>(`${this.BASE}/garantias/${id}/validaciones`, { headers: this.headers() });
  }

  // ── Talleres ──────────────────────────────────────────────────────────────

  registerWorkshop(data: WorkshopRequest): Observable<Workshop> {
    return this.http.post<Workshop>(`${this.BASE}/talleres`, data, { headers: this.headers() });
  }

  getWorkshops(ciudad?: string): Observable<Workshop[]> {
    let p = new HttpParams();
    if (ciudad) p = p.set('ciudad', ciudad);
    return this.http.get<Workshop[]>(`${this.BASE}/talleres`, { headers: this.headers(), params: p });
  }

  getWorkshopById(id: number): Observable<Workshop> {
    return this.http.get<Workshop>(`${this.BASE}/talleres/${id}`, { headers: this.headers() });
  }

  getWorkshopsNearby(lat: number, lng: number, radio?: number): Observable<Workshop[]> {
    let p = new HttpParams().set('lat', lat).set('lng', lng);
    if (radio) p = p.set('radio', radio);
    return this.http.get<Workshop[]>(`${this.BASE}/talleres/cercanos`, { headers: this.headers(), params: p });
  }

  updateWorkshop(id: number, data: WorkshopRequest): Observable<Workshop> {
    return this.http.put<Workshop>(`${this.BASE}/talleres/${id}`, data, { headers: this.headers() });
  }

  deleteWorkshop(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.BASE}/talleres/${id}`, { headers: this.headers() });
  }

  // ── Control de calidad ────────────────────────────────────────────────────

  startQualityCheck(ordenId: number): Observable<QualityCheck> {
    return this.http.post<QualityCheck>(`${this.BASE}/control-calidad?ordenId=${ordenId}`, {}, { headers: this.headers() });
  }

  getQualityCheckByOrder(ordenId: number): Observable<QualityCheck> {
    return this.http.get<QualityCheck>(`${this.BASE}/control-calidad?ordenId=${ordenId}`, { headers: this.headers() });
  }

  updateQualityCheck(id: number, data: QualityCheckRequest): Observable<QualityCheck> {
    return this.http.put<QualityCheck>(`${this.BASE}/control-calidad/${id}`, data, { headers: this.headers() });
  }

  approveQualityCheck(id: number): Observable<QualityCheck> {
    return this.http.patch<QualityCheck>(`${this.BASE}/control-calidad/${id}/aprobar`, {}, { headers: this.headers() });
  }

  rejectQualityCheck(id: number, observations?: string): Observable<QualityCheck> {
    return this.http.patch<QualityCheck>(`${this.BASE}/control-calidad/${id}/rechazar`,
      { observations }, { headers: this.headers() });
  }

  // ── Evidencias ────────────────────────────────────────────────────────────

  uploadEvidence(ordenId: number, file: File, descripcion?: string): Observable<WorkEvidence> {
    const fd = new FormData();
    fd.append('ordenId', ordenId.toString());
    fd.append('file', file);
    if (descripcion) fd.append('descripcion', descripcion);
    return this.http.post<WorkEvidence>(`${this.BASE}/evidencias`, fd, { headers: this.headers() });
  }

  getEvidences(ordenId: number, tipo?: string): Observable<WorkEvidence[]> {
    let p = new HttpParams().set('ordenId', ordenId);
    if (tipo) p = p.set('tipo', tipo);
    return this.http.get<WorkEvidence[]>(`${this.BASE}/evidencias`, { headers: this.headers(), params: p });
  }

  deleteEvidence(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.BASE}/evidencias/${id}`, { headers: this.headers() });
  }
}
