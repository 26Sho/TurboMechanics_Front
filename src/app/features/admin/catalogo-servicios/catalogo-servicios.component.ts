import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from 'src/app/shared/services/toast.service';

import { environment } from '../../../../environments/environment';
interface ServiceResponseDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

interface ServiceHistoryCheckResponseDTO {
  tieneGarantias: boolean;
  cantidadGarantias: number;
}

@Component({
  selector: 'app-catalogo-servicios',
  standalone: false,
  templateUrl: './catalogo-servicios.component.html',
  styleUrls: ['./catalogo-servicios.component.scss']
})
export class CatalogoServiciosComponent implements OnInit {

  private apiUrl = `${environment.apiUrl}/admin/catalogo`;

  servicios: ServiceResponseDTO[] = [];
  serviciosFiltrados: ServiceResponseDTO[] = [];
  busqueda = '';
  filtroActivo: 'todos' | 'activos' | 'inactivos' = 'todos';
  cargando = false;
  guardando = false;

  // Modal servicio
  modalAbierto = false;
  form!: FormGroup;

  // Modal precio
  modalPrecio = false;
  precioForm!: FormGroup;
  precioServicioId: number | null = null;
  precioServicioNombre = '';

  // Modal eliminar
  modalEliminar = false;
  idAEliminar: number | null = null;
  historialEliminar: ServiceHistoryCheckResponseDTO | null = null;
  verificandoHistorial = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.cargar();
  }

  private initForms(): void {
    this.form = this.fb.group({
      name:        ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      price:       [0,  [Validators.required, Validators.min(0)]]
    });

    this.precioForm = this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = sessionStorage.getItem('token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  cargar(): void {
    this.cargando = true;
    this.http.get<ServiceResponseDTO[]>(this.apiUrl, this.getHeaders()).subscribe({
      next: (data: ServiceResponseDTO[]) => {
        this.servicios = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => { this.toast.error('Error al cargar los servicios.'); this.cargando = false; }
    });
  }

  aplicarFiltros(): void {
    let lista = [...this.servicios];
    if (this.filtroActivo === 'activos')   lista = lista.filter(s => s.active);
    if (this.filtroActivo === 'inactivos') lista = lista.filter(s => !s.active);
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      lista = lista.filter(s =>
        s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }
    this.serviciosFiltrados = lista;
  }

  setFiltro(f: 'todos' | 'activos' | 'inactivos'): void {
    this.filtroActivo = f;
    this.aplicarFiltros();
  }

  // ── Modal servicio ────────────────────────────────────────
  abrirAgregar(): void {
    this.form.reset({ name: '', description: '', price: 0 });
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Completa todos los campos correctamente.');
      return;
    }
    this.guardando = true;
    this.http.post<ServiceResponseDTO>(this.apiUrl, this.form.value, this.getHeaders()).subscribe({
      next: () => {
        this.toast.success('Servicio registrado correctamente.');
        this.cargar();
        this.cerrarModal();
        this.guardando = false;
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'Error al registrar el servicio.');
        this.guardando = false;
      }
    });
  }

  // ── Modal precio ──────────────────────────────────────────
  abrirPrecio(s: ServiceResponseDTO): void {
    this.precioServicioId    = s.id;
    this.precioServicioNombre = s.name;
    this.precioForm.reset({ price: s.price });
    this.modalPrecio = true;
  }

  guardarPrecio(): void {
    if (this.precioForm.invalid) { this.precioForm.markAllAsTouched(); return; }
    if (!this.precioServicioId) return;
    this.http.patch<ServiceResponseDTO>(
      `${this.apiUrl}/${this.precioServicioId}/price`,
      this.precioForm.value,
      this.getHeaders()
    ).subscribe({
      next: () => { this.toast.success('Precio actualizado correctamente.'); this.modalPrecio = false; this.cargar(); },
      error: () => this.toast.error('Error al actualizar el precio.')
    });
  }

  // ── Toggle estado ─────────────────────────────────────────
  toggleEstado(id: number): void {
    this.http.patch<ServiceResponseDTO>(`${this.apiUrl}/${id}/status`, {}, this.getHeaders()).subscribe({
      next: () => this.cargar(),
      error: () => this.toast.error('Error al cambiar el estado.')
    });
  }

  // ── Eliminar ──────────────────────────────────────────────
  confirmarEliminar(id: number): void {
    this.idAEliminar = id;
    this.historialEliminar = null;
    this.verificandoHistorial = true;
    this.modalEliminar = true;

    this.http.get<ServiceHistoryCheckResponseDTO>(`${this.apiUrl}/${id}/historial-check`, this.getHeaders()).subscribe({
      next: (data) => { this.historialEliminar = data; this.verificandoHistorial = false; },
      // Si falla la verificación, no bloqueamos el flujo: se sigue pudiendo eliminar
      error: () => { this.verificandoHistorial = false; }
    });
  }

  get tieneHistorial(): boolean {
    return !!this.historialEliminar && this.historialEliminar.tieneGarantias;
  }

  eliminar(): void {
    if (!this.idAEliminar) return;
    this.http.delete(`${this.apiUrl}/${this.idAEliminar}`, this.getHeaders()).subscribe({
      next: () => {
        this.toast.success('Servicio eliminado correctamente.');
        this.cargar();
        this.modalEliminar = false;
        this.idAEliminar = null;
        this.historialEliminar = null;
      },
      error: (err: { error?: { message?: string } }) =>
        this.toast.error(err.error?.message || 'Error al eliminar el servicio.')
    });
  }

  cancelarEliminar(): void {
    this.modalEliminar = false;
    this.idAEliminar = null;
    this.historialEliminar = null;
  }

  // ── Helpers ───────────────────────────────────────────────
  formatPeso(v: number): string { return `$${v.toLocaleString('es-CO')}`; }

  get f() { return this.form.controls; }
  get pf() { return this.precioForm.controls; }
}