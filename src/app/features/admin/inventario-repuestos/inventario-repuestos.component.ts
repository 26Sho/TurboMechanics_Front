import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from 'src/app/shared/services/toast.service';

interface SparePartsResponseDTO {
  id: number;
  name: string;
  reference: string;
  stock: number;
  stockMin: number;
  price: number;
  category: string;
  statusStock: string;
}

interface MovementsResponseDTO {
  id: number;
  spacePartsId: number;
  spacePartsName: string;
  type: string;
  stock: number;
  date: string;
  motive: string;
}

@Component({
  selector: 'app-inventario-repuestos',
  standalone: false,
  templateUrl: './inventario-repuestos.component.html',
  styleUrls: ['./inventario-repuestos.component.scss']
})
export class InventarioRepuestosComponent implements OnInit {

  private apiUrl = 'http://localhost:9090/admin/inventario';

  repuestos: SparePartsResponseDTO[] = [];
  repuestosFiltrados: SparePartsResponseDTO[] = [];
  busqueda = '';
  filtroCategoria = 'todas';
  categorias: string[] = [];
  cargando = false;
  guardando = false;

  // Modal repuesto
  modalAbierto = false;
  modoEdicion = false;
  repuestoEditId = 0;
  form!: FormGroup;

  // Modal movimiento
  modalMovimiento = false;
  movForm!: FormGroup;
  movRepuestoId: number | null = null;
  movRepuestoNombre = '';
  guardandoMov = false;

  // Modal historial
  modalHistorial = false;
  historialNombre = '';
  historial: MovementsResponseDTO[] = [];
  cargandoHistorial = false;

  // Modal eliminar
  modalEliminar = false;
  idAEliminar: number | null = null;

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
      name:      ['', [Validators.required, Validators.minLength(3)]],
      reference: ['', [Validators.required, Validators.minLength(2)]],
      category:  ['', [Validators.required]],
      price:     [0,  [Validators.required, Validators.min(0)]],
      stock:     [0,  [Validators.required, Validators.min(0)]],
      stockMin:  [5,  [Validators.required, Validators.min(0)]]
    });

    this.movForm = this.fb.group({
      type:   ['Input', Validators.required],
      stock:  [1, [Validators.required, Validators.min(1)]],
      motive: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  cargar(): void {
    this.cargando = true;
    this.http.get<SparePartsResponseDTO[]>(this.apiUrl, this.getHeaders()).subscribe({
      next: (data: SparePartsResponseDTO[]) => {
        this.repuestos = data;
        const cats = data.map((r: SparePartsResponseDTO) => r.category);
        this.categorias = ['todas', ...Array.from(new Set(cats))];
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => { this.toast.error('Error al cargar los repuestos.'); this.cargando = false; }
    });
  }

  aplicarFiltros(): void {
    let lista = [...this.repuestos];
    if (this.filtroCategoria !== 'todas') lista = lista.filter(r => r.category === this.filtroCategoria);
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      lista = lista.filter(r =>
        r.name.toLowerCase().includes(q) || r.reference.toLowerCase().includes(q)
      );
    }
    this.repuestosFiltrados = lista;
  }

  // ── CRUD ──────────────────────────────────────────────────
  abrirAgregar(): void {
    this.modoEdicion = false;
    this.form.reset({ name: '', reference: '', category: '', price: 0, stock: 0, stockMin: 5 });
    this.modalAbierto = true;
  }

  abrirEditar(r: SparePartsResponseDTO): void {
    this.modoEdicion = true;
    this.repuestoEditId = r.id;
    this.form.patchValue({
      name: r.name, reference: r.reference, category: r.category,
      price: r.price, stock: r.stock, stockMin: r.stockMin
    });
    this.modalAbierto = true;
  }

  cerrarModal(): void { this.modalAbierto = false; this.form.reset(); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.toast.warning('Completa todos los campos.'); return; }
    this.guardando = true;

    const req$ = this.modoEdicion
      ? this.http.put<SparePartsResponseDTO>(`${this.apiUrl}/${this.repuestoEditId}`, this.form.value, this.getHeaders())
      : this.http.post<SparePartsResponseDTO>(this.apiUrl, this.form.value, this.getHeaders());

    req$.subscribe({
      next: () => {
        this.toast.success(this.modoEdicion ? 'Repuesto actualizado.' : 'Repuesto registrado.');
        this.cargar(); this.cerrarModal(); this.guardando = false;
      },
      error: (err: any) => { this.toast.error(err.error?.message || 'Error al guardar.'); this.guardando = false; }
    });
  }

  confirmarEliminar(id: number): void { this.idAEliminar = id; this.modalEliminar = true; }

  eliminar(): void {
    if (!this.idAEliminar) return;
    this.http.delete(`${this.apiUrl}/${this.idAEliminar}`, this.getHeaders()).subscribe({
      next: () => { this.toast.success('Repuesto eliminado.'); this.cargar(); this.modalEliminar = false; this.idAEliminar = null; },
      error: () => this.toast.error('Error al eliminar.')
    });
  }

  // ── Movimiento ────────────────────────────────────────────
  abrirMovimiento(r: SparePartsResponseDTO): void {
    this.movRepuestoId     = r.id;
    this.movRepuestoNombre = r.name;
    this.movForm.reset({ type: 'Input', stock: 1, motive: '' });
    this.modalMovimiento = true;
  }

  guardarMovimiento(): void {
    if (this.movForm.invalid) { this.movForm.markAllAsTouched(); return; }
    if (!this.movRepuestoId) return;
    this.guardandoMov = true;
    this.http.post<MovementsResponseDTO>(
      `${this.apiUrl}/${this.movRepuestoId}/movimientos`,
      this.movForm.value,
      this.getHeaders()
    ).subscribe({
      next: () => { this.toast.success('Movimiento registrado.'); this.cargar(); this.modalMovimiento = false; this.guardandoMov = false; },
      error: (err: any) => { this.toast.error(err.error?.message || 'Error al registrar movimiento.'); this.guardandoMov = false; }
    });
  }

  // ── Historial ─────────────────────────────────────────────
  verHistorial(r: SparePartsResponseDTO): void {
    this.historialNombre = r.name;
    this.historial = [];
    this.cargandoHistorial = true;
    this.modalHistorial = true;
    this.http.get<MovementsResponseDTO[]>(`${this.apiUrl}/${r.id}/movimientos`, this.getHeaders()).subscribe({
      next: (data: MovementsResponseDTO[]) => { this.historial = data; this.cargandoHistorial = false; },
      error: () => { this.toast.error('Error al cargar historial.'); this.cargandoHistorial = false; }
    });
  }

  formatPeso(v: number): string { return `$${v.toLocaleString('es-CO')}`; }
  formatFecha(d: string): string {
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  get f() { return this.form.controls; }
  get mf() { return this.movForm.controls; }
}
