import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from 'src/app/shared/services/toast.service';

export type LaborStatus = 'ACTIVO' | 'INACTIVO' | 'VACACIONES' | 'LICENCIA' | 'SUSPENDIDO';

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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
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
  guardando = false;

  // Modal registrar / editar
  modalAbierto = false;
  modoEdicion = false;
  documentoEdicion: number | null = null;
  form!: FormGroup;

  // Modal cambiar estado laboral
  modalEstado = false;
  estadoForm!: FormGroup;
  mecanicoEstadoId: number | null = null;
  mecanicoEstadoNombre = '';

  // Modal eliminar
  modalEliminar = false;
  documentoAEliminar: number | null = null;

  // Modal historial
  modalHistorial = false;
  mecanicoHistorialNombre = '';
  historial: any[] = [];

  readonly estadosLaborales: LaborStatus[] = [
    'ACTIVO', 'INACTIVO', 'VACACIONES', 'LICENCIA', 'SUSPENDIDO'
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

  // ─── Forms ───────────────────────────────────────────────

  private initForms(): void {
    this.form = this.fb.group({
      name:        ['', [Validators.required, Validators.minLength(3)]],
      document:    [null, [Validators.required, Validators.min(1000000)]],
      position:    ['', [Validators.required, Validators.minLength(2)]],
      hireDate:    ['', Validators.required],
      phone:       ['', [Validators.pattern('^[0-9]{7,15}$')]],
      email:       ['', [Validators.email]],
      salary:      [null, [Validators.min(0.01)]],
      laborStatus: ['ACTIVO']
    });

    this.estadoForm = this.fb.group({
      laborStatus: ['ACTIVO', Validators.required]
    });
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
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

    if (this.filtroEstado !== 'todos') {
      lista = lista.filter(m => m.laborStatus === this.filtroEstado);
    }

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

  // ─── Modal Registrar / Editar ─────────────────────────────

  abrirRegistrar(): void {
    this.modoEdicion = false;
    this.documentoEdicion = null;
    this.form.reset({ laborStatus: 'ACTIVO' });
    this.modalAbierto = true;
  }

  abrirEditar(m: MechanicResponseDTO): void {
    this.modoEdicion = true;
    this.documentoEdicion = m.document;
    this.form.patchValue({
      name:        m.name,
      document:    m.document,
      position:    m.position,
      hireDate:    m.hireDate,
      phone:       m.phone || '',
      email:       m.email || '',
      salary:      m.salary || null,
      laborStatus: m.laborStatus
    });
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Completa todos los campos requeridos correctamente.');
      return;
    }

    this.guardando = true;
    const payload = this.form.value;

    if (this.modoEdicion && this.documentoEdicion !== null) {
      this.http.put<MechanicResponseDTO>(
        `${this.apiUrl}/${this.documentoEdicion}`, payload, this.getHeaders()
      ).subscribe({
        next: () => {
          this.toast.success('Mecánico actualizado correctamente.');
          this.cargar();
          this.cerrarModal();
          this.guardando = false;
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Error al actualizar el mecánico.');
          this.guardando = false;
        }
      });
    } else {
      this.http.post<MechanicResponseDTO>(this.apiUrl, payload, this.getHeaders()).subscribe({
        next: () => {
          this.toast.success('Mecánico registrado correctamente.');
          this.cargar();
          this.cerrarModal();
          this.guardando = false;
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Error al registrar el mecánico.');
          this.guardando = false;
        }
      });
    }
  }

  // ─── Modal Estado Laboral ─────────────────────────────────

  abrirEstado(m: MechanicResponseDTO): void {
    this.mecanicoEstadoId = m.document;
    this.mecanicoEstadoNombre = m.name;
    this.estadoForm.patchValue({ laborStatus: m.laborStatus });
    this.modalEstado = true;
  }

  guardarEstado(): void {
    if (this.estadoForm.invalid || this.mecanicoEstadoId === null) return;
    const nuevoEstado = this.estadoForm.value.laborStatus;

    this.http.put<MechanicResponseDTO>(
      `${this.apiUrl}/${this.mecanicoEstadoId}`,
      { ...this.mecanicos.find(m => m.document === this.mecanicoEstadoId), laborStatus: nuevoEstado },
      this.getHeaders()
    ).subscribe({
      next: () => {
        this.toast.success('Estado laboral actualizado.');
        this.modalEstado = false;
        this.cargar();
      },
      error: () => this.toast.error('Error al actualizar el estado laboral.')
    });
  }

  // ─── Modal Eliminar ───────────────────────────────────────

  confirmarEliminar(document: number): void {
    this.documentoAEliminar = document;
    this.modalEliminar = true;
  }

  eliminar(): void {
    if (!this.documentoAEliminar) return;
    this.http.delete(`${this.apiUrl}/${this.documentoAEliminar}`, this.getHeaders()).subscribe({
      next: () => {
        this.toast.success('Mecánico eliminado correctamente.');
        this.cargar();
        this.modalEliminar = false;
        this.documentoAEliminar = null;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'No se puede eliminar al mecánico.');
        this.modalEliminar = false;
      }
    });
  }

  // ─── Modal Historial ──────────────────────────────────────

  verHistorial(m: MechanicResponseDTO): void {
    this.mecanicoHistorialNombre = m.name;
    // Filtramos órdenes de trabajo del mecánico desde el back cuando esté disponible
    // Por ahora mostramos mensaje vacío
    this.historial = [];
    this.modalHistorial = true;
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

  get f() { return this.form.controls; }
  get ef() { return this.estadoForm.controls; }
}
