import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BillingService } from '../../../admin/service/billing.service';
import { MercadoPagoService } from '../../../../core/services/mercado-pagos-service.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Bill, CreatePaymentRequest } from '../../../../core/models/billing.model';

@Component({
  selector: 'app-client-bills',
  templateUrl: './client-bills.component.html',
  styleUrls: ['./client-bills.component.scss']
})
export class ClientBillsComponent implements OnInit {

  bills: Bill[]   = [];
  loading         = false;
  searched        = false;

  searchForm!: FormGroup;

  showPayModal  = false;
  payBill: Bill | null = null;
  payForm!: FormGroup;
  paying        = false;

  readonly payMethodOptions = [
    { value: 'credit_card',   icon: '💳', label: 'Tarjeta crédito' },
    { value: 'debit_card',    icon: '🏧', label: 'Tarjeta débito'  },
    { value: 'pse',           icon: '🏦', label: 'PSE'             },
    { value: 'efecty',        icon: '💵', label: 'Efecty'          },
    { value: 'bank_transfer', icon: '🔁', label: 'Transferencia'   },
  ];

  constructor(
    private fb:      FormBuilder,
    private billing: BillingService,
    private mp:      MercadoPagoService,
    private toast:   ToastService
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      identification: [null, [Validators.required, Validators.min(1)]],
    });

    this.payForm = this.fb.group({
      payerEmail:                ['', [Validators.required, Validators.email]],
      payerFirstName:            [''],
      payerLastName:             [''],
      payerIdentificationType:   ['CC'],
      payerIdentificationNumber: [''],
      paymentMethod:             [''],
    });
  }

  loadMyBills(): void {
    this.searchForm.markAllAsTouched();
    if (this.searchForm.invalid) return;

    this.loading  = true;
    this.searched = false;

    this.billing.history(this.searchForm.value.identification).subscribe({
      next: (bills) => {
        this.bills    = bills ?? [];
        this.loading  = false;
        this.searched = true;
      },
      error: () => {
        this.loading  = false;
        this.searched = true;
        this.toast.error('Error al cargar las facturas');
      }
    });
  }

  canPay(status: string): boolean {
    return !!status && status.trim() === 'Pending';
  }

  openPay(bill: Bill): void {
    this.payBill = bill;
    this.payForm.reset({ payerIdentificationType: 'CC' });
    this.showPayModal = true;
  }

  closePay(): void {
    this.showPayModal = false;
    this.payBill = null;
  }

  submitPay(): void {
    this.payForm.markAllAsTouched();
    if (this.payForm.invalid || !this.payBill) return;

    this.paying = true;

    const req: CreatePaymentRequest = {
      billId:                    this.payBill.id,
      payerEmail:                this.payForm.value.payerEmail,
      payerFirstName:            this.payForm.value.payerFirstName            || undefined,
      payerLastName:             this.payForm.value.payerLastName             || undefined,
      payerIdentificationType:   this.payForm.value.payerIdentificationType   || undefined,
      payerIdentificationNumber: this.payForm.value.payerIdentificationNumber || undefined,
      paymentMethod:             this.payForm.value.paymentMethod             || undefined,
    };

    this.mp.createPreference(req).subscribe({
      next: (res) => {
        this.paying = false;
        this.closePay();
        if (res.initPoint) {
          window.location.href = res.initPoint;
        } else {
          this.toast.error('No se recibió la URL de pago');
        }
      },
      error: (err) => {
        this.paying = false;
        this.toast.error(err.error?.message || 'Error al iniciar el pago');
      }
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = { Pending: 'Pendiente', Paid: 'Pagado', Annulled: 'Anulado' };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = { Pending: 'badge--pending', Paid: 'badge--paid', Annulled: 'badge--annulled' };
    return map[status] ?? '';
  }
}