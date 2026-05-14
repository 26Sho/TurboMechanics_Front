import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MovementService } from '../service/movement.service';
import { PaymentMethodService } from '../service/payment-method.service';
import { ToastService } from '../../../shared/services/toast.service';
import { MovementConcept, MovementPay, MovementType, PayMethod, RegisterMovementRequest } from '../../../core/models/billing.model';

@Component({
  selector: 'app-movements',
  templateUrl: './movements.component.html',
  styleUrls: ['./movements.component.scss']
})
export class MovementsComponent implements OnInit {

  form!: FormGroup;
  saving      = false;
  showForm    = false;

  movements:   MovementPay[] = [];
  payMethods:  PayMethod[]   = [];

  readonly types: { value: MovementType; label: string }[] = [
    { value: 'Input',  label: 'Entrada' },
    { value: 'Output', label: 'Salida'  },
  ];

  readonly concepts: { value: MovementConcept; label: string }[] = [
    { value: 'Buy',         label: 'Compra'       },
    { value: 'Devolutions', label: 'Devolución'   },
    { value: 'Sale',        label: 'Venta'        },
    { value: 'Use',         label: 'Uso'          },
  ];

  constructor(
    private fb:          FormBuilder,
    private movService:  MovementService,
    private pmService:   PaymentMethodService,
    private toast:       ToastService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.pmService.list().subscribe({
      next: (list) => { this.payMethods = (list ?? []).filter(p => p.active); },
      error: ()    => {}
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      type:                     ['', Validators.required],
      concept:                  ['', Validators.required],
      description:              [''],
      amount:                   [null, [Validators.required, Validators.min(1)]],
      billId:                   [null],
      payMethod:                [null],
      registerByIdentification: [null, Validators.required],
    });

  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  openForm(): void  { this.showForm = true; }
  closeForm(): void { this.showForm = false; this.form.reset(); this.buildForm(); }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving = true;
    const v = this.form.value;

    const payload: RegisterMovementRequest = {
      type:                     v.type,
      concept:                  v.concept,
      description:              v.description || undefined,
      amount:                   v.amount,
      billId:                   v.billId     || undefined,
      payMethod:                v.payMethod  || undefined,
      registerByIdentification: v.registerByIdentification,
    };

    this.movService.register(payload).subscribe({
      next: (res) => {
        this.toast.success('Movimiento registrado correctamente');
        this.movements.unshift(res);
        this.saving = false;
        this.closeForm();
      },
      error: () => {
        this.toast.error('Error al registrar el movimiento');
        this.saving = false;
      }
    });
  }

  typeLabel(type: MovementType): string {
    return type === 'Input' ? 'Entrada' : 'Salida';
  }

  conceptLabel(concept: MovementConcept): string {
    const map: Record<MovementConcept, string> = {
      Buy: 'Compra', Devolutions: 'Devolución', Sale: 'Venta', Use: 'Uso'
    };
    return map[concept] ?? concept;
  }
}