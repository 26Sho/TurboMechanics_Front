import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PayMethod } from '../../../core/models/billing.model';
import { PaymentMethodService } from '../service/payment-method.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  standalone: false,
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent implements OnInit {

  payMethods: PayMethod[] = [];
  loading = false;
  saving = false;

  showForm = false;
  editingId: number | null = null;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private pmService: PaymentMethodService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadList();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(80)]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      configJson: [''],
      active: [true]
    });
  }

  loadList(): void {
    this.loading = true;
    this.pmService.list().subscribe({
      next: (list) => { this.payMethods = list; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Error al cargar métodos de pago'); }
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ active: true, configJson: '' });
    this.showForm = true;
  }

  openEdit(pm: PayMethod): void {
    this.editingId = pm.id;
    this.form.patchValue({
      name: pm.name,
      description: pm.description,
      configJson: pm.configJson || '',
      active: pm.active
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form.reset({ active: true });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving = true;
    const payload = this.form.value;

    const op$ = this.editingId === null
      ? this.pmService.create(payload)
      : this.pmService.update(this.editingId, payload);

    op$.subscribe({
      next: () => {
        this.toast.success(this.editingId === null
          ? 'Método de pago creado correctamente'
          : 'Método de pago actualizado correctamente');
        this.saving = false;
        this.closeForm();
        this.loadList();
      },
      error: (err) => {
        this.toast.error(
          err.status === 400
            ? 'Ya existe un método de pago con ese nombre'
            : 'Error al guardar el método de pago'
        );
        this.saving = false;
      }
    });
  }

  statusLabel(active: boolean): string {
    return active ? 'Activo' : 'Inactivo';
  }
}