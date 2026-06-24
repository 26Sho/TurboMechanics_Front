import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from 'src/app/shared/services/toast.service';

export type LaborStatus = 'ACTIVO' | 'INACTIVO' | 'VACACIONES' | 'LICENCIA' | 'SUSPENDIDO';
export type AbsenceType = 'INCAPACIDAD' | 'VACACIONES' | 'PERMISO' | 'CALAMIDAD' | 'OTRO';

export interface MechanicResponseDTO {
  id: number;
  name: string;
  document: number;
  position: string;
  hireDate: string;
  phone: string;
  email: string;
  salary: number;
  laborStatus: LaborStatus;
  maxOrderCapacity: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface WorkOrderResponseDTO {
  id: number;
  numberorder: string;
  clientname: string;
  vehicleplate: string;
  vehiclebrand: string;
  vehiclemodel: string;
  stateorder: string;
  priority: string;
  datecreation: string;
  assignedMechanicName: string;
}

export interface MechanicAbsenceResponseDTO {
  id: number;
  mechanicId: number;
  mechanicName: string;
  mechanicDocument: number;
  startDate: string;
  endDate: string;
  reason: string;
  absenceType: AbsenceType;
  registeredBy: string;
  registeredAt: string;
}

@Component({
  selector: 'app-mecanicos',
  standalone: false,
  templateUrl: './mecanicos.component.html',
  styleUrls: ['./mecanicos.component.scss']
})
export class MecanicosComponent implements OnInit {

  private apiUrl = 'http://localhost:9090/mecanicos';

  mecanicos: MechanicResponseDTO[] = [];
  mecanicosFiltered: MechanicResponseDTO[] = [];
  busqueda = '';
  filtroEstado: LaborStatus | 'todos' = 'todos';
  cargando = false;

  // Modal historial de trabajos
  modalHistorial = false;
  mecanicoHistorialNombre = '';
  historial: WorkOrderResponseDTO[] = [];
  cargandoHistorial = false;

  // Modal ausencias
  modalAusencias = false;
  mecanicoAusenciasDoc: number | null = null;
  mecanicoAusenciasNombre = '';
  ausencias: MechanicAbsenceResponseDTO[] = [];
  cargandoAusencias = false;
  modalNuevaAusencia = false;
  ausenciaForm!: FormGroup;
  guardandoAusencia = false;

  readonly tiposAusencia: AbsenceType[] = [
    'INCAPACIDAD', 'VACACIONES', 'PERMISO', 'CALAMIDAD', 'OTRO'
  ];

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
    this.ausenciaForm = this.fb.group({
      absenceType: ['', Validators.required],
      startDate:   ['', Validators.required],
      endDate:     ['', Validators.required],
      reason:      ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = sessionStorage.getItem('token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  // ─── Carga ────────────────────────────────────────────────

  cargar(): void {
    this.cargando = true;
    this.http.get<MechanicResponseDTO[]>(this.apiUrl, this.getHeaders()).subscribe({
      next: (data) => {
        this.mecanicos = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => {
        this.toast.error('Error al cargar los mecánicos.');
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let lista = [...this.mecanicos];
    if (this.filtroEstado !== 'todos')
      lista = lista.filter(m => m.laborStatus === this.filtroEstado);
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      lista = lista.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.position.toLowerCase().includes(q) ||
        String(m.document).includes(q)
      );
    }
    this.mecanicosFiltered = lista;
  }

  setFiltro(f: LaborStatus | 'todos'): void {
    this.filtroEstado = f;
    this.aplicarFiltros();
  }

  // ─── Modal Historial de trabajos ──────────────────────────

  verHistorial(m: MechanicResponseDTO): void {
    this.mecanicoHistorialNombre = m.name;
    this.historial = [];
    this.cargandoHistorial = true;
    this.modalHistorial = true;

    this.http.get<WorkOrderResponseDTO[]>(
      `${this.apiUrl}/${m.document}/historial`, this.getHeaders()
    ).subscribe({
      next: (data) => { this.historial = data; this.cargandoHistorial = false; },
      error: () => { this.toast.error('Error al cargar el historial.'); this.cargandoHistorial = false; }
    });
  }

  // ─── Modal Ausencias ──────────────────────────────────────

  verAusencias(m: MechanicResponseDTO): void {
    this.mecanicoAusenciasDoc = m.document;
    this.mecanicoAusenciasNombre = m.name;
    this.ausencias = [];
    this.cargandoAusencias = true;
    this.modalAusencias = true;

    this.http.get<MechanicAbsenceResponseDTO[]>(
      `${this.apiUrl}/${m.document}/ausencias`, this.getHeaders()
    ).subscribe({
      next: (data) => { this.ausencias = data; this.cargandoAusencias = false; },
      error: () => { this.toast.error('Error al cargar las ausencias.'); this.cargandoAusencias = false; }
    });
  }

  abrirNuevaAusencia(): void {
    this.ausenciaForm.reset();
    this.modalNuevaAusencia = true;
  }

  guardarAusencia(): void {
    if (this.ausenciaForm.invalid) {
      this.ausenciaForm.markAllAsTouched();
      return;
    }
    this.guardandoAusencia = true;
    const v = this.ausenciaForm.value;
    const payload = {
      absenceType: v.absenceType,
      startDate:   v.startDate + ':00',
      endDate:     v.endDate + ':00',
      reason:      v.reason
    };

    this.http.post<MechanicAbsenceResponseDTO>(
      `${this.apiUrl}/${this.mecanicoAusenciasDoc}/ausencias`, payload, this.getHeaders()
    ).subscribe({
      next: (data) => {
        this.toast.success('Ausencia registrada correctamente.');
        this.ausencias.unshift(data);
        this.modalNuevaAusencia = false;
        this.guardandoAusencia = false;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al registrar la ausencia.');
        this.guardandoAusencia = false;
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────

  formatPeso(v: number): string {
    return v != null ? `$${v.toLocaleString('es-CO')}` : '—';
  }

  formatFecha(f: string): string {
    if (!f) return '—';
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatDateTime(f: string): string {
    if (!f) return '—';
    return new Date(f).toLocaleString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  estadoLabel(s: LaborStatus): string {
    const map: Record<LaborStatus, string> = {
      ACTIVO: 'Activo', INACTIVO: 'Inactivo',
      VACACIONES: 'Vacaciones', LICENCIA: 'Licencia', SUSPENDIDO: 'Suspendido'
    };
    return map[s] ?? s;
  }

  estadoBadgeClass(s: LaborStatus): string {
    const map: Record<LaborStatus, string> = {
      ACTIVO:     'inv-badge--active',
      INACTIVO:   'inv-badge--inactive',
      VACACIONES: 'inv-badge--warning',
      LICENCIA:   'inv-badge--warning',
      SUSPENDIDO: 'inv-badge--danger'
    };
    return map[s] ?? '';
  }

  ausenciaLabel(t: AbsenceType): string {
    const map: Record<AbsenceType, string> = {
      INCAPACIDAD: 'Incapacidad', VACACIONES: 'Vacaciones',
      PERMISO: 'Permiso', CALAMIDAD: 'Calamidad', OTRO: 'Otro'
    };
    return map[t] ?? t;
  }

  prioridadClass(p: string): string {
    const map: Record<string, string> = {
      URGENTE: 'inv-badge--danger', ALTA: 'inv-badge--warning',
      NORMAL: 'inv-badge--active', BAJA: 'inv-badge--inactive'
    };
    return map[p] ?? '';
  }

  get af() { return this.ausenciaForm.controls; }
}