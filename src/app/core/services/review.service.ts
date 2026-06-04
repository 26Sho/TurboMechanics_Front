import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface ReviewRequestDTO {
  workOrderId: number;
  comment: string;
  rating: number;
}

export interface ReviewResponseDTO {
  id: number;
  userId: number;
  username: string;
  workOrderId: number;
  workOrderNumber: string;
  comment: string;
  rating: number;
  reviewDate: string;   // LocalDateTime como string ISO
}

export interface DeliveredOrderOption {
  id: number;
  numberorder: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ReviewService {

  private readonly apiUrl = 'http://localhost:9090/reviews';
  private readonly ordersUrl = 'http://localhost:9090/orders';

  constructor(private http: HttpClient) {}

  // HU 10.1 – Registrar reseña
  create(data: ReviewRequestDTO): Observable<ReviewResponseDTO> {
    return this.http.post<ReviewResponseDTO>(this.apiUrl, data);
  }

  // HU 10.2 – Eliminar reseña propia (cliente)
  deleteOwn(reviewId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${reviewId}`);
  }

  // HU 10.3 – Listar todas las reseñas activas
  listAll(ordenar: string = 'fecha'): Observable<ReviewResponseDTO[]> {
    return this.http.get<ReviewResponseDTO[]>(`${this.apiUrl}?ordenar=${ordenar}`);
  }

  // HU 10.3b – Listar reseñas públicas (sin autenticación, para visitantes)
  listAllPublic(ordenar: string = 'fecha'): Observable<ReviewResponseDTO[]> {
    return this.http.get<ReviewResponseDTO[]>(`${this.apiUrl}/public?ordenar=${ordenar}`);
  }

  // HU 10.3 – Listar mis reseñas (cliente autenticado)
  listMine(): Observable<ReviewResponseDTO[]> {
    return this.http.get<ReviewResponseDTO[]>(`${this.apiUrl}/my`);
  }

  // HU 10.4 – Moderar reseña (admin)
  moderate(reviewId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${reviewId}/moderate`);
  }

  // Obtener órdenes ENTREGADAS del cliente (para el select del formulario)
  getDeliveredOrders(clientIdentification: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.ordersUrl}/client/${clientIdentification}`);
  }
}