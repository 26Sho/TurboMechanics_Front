import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteVehicleService } from 'src/app/core/services/cliente-vehicle.service';
import { VehiculoClienteResponse } from 'src/app/core/models/vehiculo-cliente';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  standalone: false,
  selector: 'app-mis-vehiculos',
  templateUrl: './mis-vehiculos.component.html',
  styleUrls: ['./mis-vehiculos.component.scss']
})
export class MisVehiculosComponent implements OnInit {

  vehiculos: VehiculoClienteResponse[] = [];
  loading = false;

  // ── Formulario registro/edicion ──────────────────────────────
  form!: FormGroup;
  saving = false;
  editMode = false;
  editId: number | null = null;
  showForm = false;

  // ── Confirmacion eliminar ────────────────────────────────────
  showDeleteModal = false;
  deletingId: number | null = null;
  deleting = false;

  tiposVehiculo = ['Carro', 'Moto', 'Camioneta', 'Camión', 'Bus', 'Otro'];

  constructor(
    private fb: FormBuilder,
    private vehicleService: ClienteVehicleService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.cargarVehiculos();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      placa:      ['', [Validators.required, Validators.pattern('^[A-Za-z0-9\\-]{3,10}$')]],
      marca:      ['', Validators.required],
      modelo:     ['', Validators.required],
      anio:       ['', [Validators.required, Validators.min(1970), Validators.max(2030)]],
      color:      [''],
      tipo:       [''],
      cilindraje: ['']
    });
  }

  cargarVehiculos(): void {
    this.loading = true;
    this.vehicleService.list().subscribe({
      next: (data) => { this.vehiculos = data; this.loading = false; },
      error: () => { this.toast.error('Error al cargar los vehículos'); this.loading = false; }
    });
  }

  // ── Abrir formulario nuevo ───────────────────────────────────
  abrirFormNuevo(): void {
    this.editMode = false;
    this.editId = null;
    this.form.reset();
    this.showForm = true;
  }

  // ── Abrir formulario edicion ─────────────────────────────────
  abrirFormEditar(v: VehiculoClienteResponse): void {
    this.editMode = true;
    this.editId = v.id;
    this.form.patchValue({
      placa:      v.placa,
      marca:      v.marca,
      modelo:     v.modelo,
      anio:       v.anio,
      color:      v.color || '',
      tipo:       v.tipo || '',
      cilindraje: v.cilindraje || ''
    });
    this.showForm = true;
  }

  cerrarForm(): void {
    this.showForm = false;
    this.form.reset();
    this.editMode = false;
    this.editId = null;
  }

  // ── Guardar ──────────────────────────────────────────────────
  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const payload = {
      ...this.form.value,
      anio: Number(this.form.value.anio)
    };

    const obs$ = this.editMode && this.editId
      ? this.vehicleService.update(this.editId, payload)
      : this.vehicleService.register(payload);

    obs$.subscribe({
      next: (res) => {
        if (this.editMode) {
          const idx = this.vehiculos.findIndex(v => v.id === res.id);
          if (idx !== -1) this.vehiculos[idx] = res;
          this.toast.success('Vehículo actualizado correctamente');
        } else {
          this.vehiculos.unshift(res);
          this.toast.success('Vehículo registrado correctamente');
        }
        this.saving = false;
        this.cerrarForm();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Error al guardar el vehículo');
        this.saving = false;
      }
    });
  }

  // ── Eliminar ─────────────────────────────────────────────────
  confirmarEliminar(id: number): void {
    this.deletingId = id;
    this.showDeleteModal = true;
  }

  cancelarEliminar(): void {
    this.showDeleteModal = false;
    this.deletingId = null;
  }

  eliminar(): void {
    if (!this.deletingId) return;
    this.deleting = true;
    this.vehicleService.delete(this.deletingId).subscribe({
      next: () => {
        this.vehiculos = this.vehiculos.filter(v => v.id !== this.deletingId);
        this.toast.success('Vehículo eliminado correctamente');
        this.deleting = false;
        this.cancelarEliminar();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Error al eliminar el vehículo');
        this.deleting = false;
      }
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
}