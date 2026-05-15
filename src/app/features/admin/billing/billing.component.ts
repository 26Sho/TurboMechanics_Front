import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BillingService } from '../service/billing.service';
import { PaymentMethodService } from '../service/payment-method.service';
import { WorkOrderService } from '../../../core/services/work-order.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Bill, PayMethod } from '../../../core/models/billing.model';
import { WorkOrderResponse } from '../../../core/models/work-order';

type TabType = 'generate' | 'history';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {

  activeTab: TabType = 'generate';

  // ── Generate form ─────────────────────────────────────────────────────────
  generateForm!: FormGroup;
  saving        = false;
  generatedBill: Bill | null = null;

  payMethods:   PayMethod[]        = [];
  orders:       WorkOrderResponse[] = [];
  loadingOrders = false;

  // ── Assign form ───────────────────────────────────────────────────────────
  showAssignModal = false;
  assignBill:     Bill | null = null;
  assignForm!:    FormGroup;
  assigning       = false;

  // ── Send proof ────────────────────────────────────────────────────────────
  showSendModal  = false;
  sendBill:      Bill | null = null;
  sendingProof   = false;
  selectedCanal  = 'EMAIL';

  // ── Download ──────────────────────────────────────────────────────────────
  downloadingId: number | null = null;

  // ── History ───────────────────────────────────────────────────────────────
  historyForm!:  FormGroup;
  historyBills:  Bill[]   = [];
  loadingHistory = false;
  historySearched = false;

  constructor(
    private fb:         FormBuilder,
    private billing:    BillingService,
    private pmService:  PaymentMethodService,
    private woService:  WorkOrderService,
    private toast:      ToastService,
    private auth:       AuthService
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadPayMethods();
    this.loadOrders();
  }

  private buildForms(): void {
    this.generateForm = this.fb.group({
      workOrderID:    [null, Validators.required],
      identification: [null, [Validators.required, Validators.min(1)]],
      plate:          ['',  Validators.required],
      payMethodId:    [null, Validators.required],
      subtotal:       [null, [Validators.required, Validators.min(1)]],
      createdBy:      [this.auth.getUsername(), Validators.required],
    });

    this.assignForm = this.fb.group({
      identification: [null, [Validators.required, Validators.min(1)]],
      plate:          ['',   Validators.required],
    });

    this.historyForm = this.fb.group({
      identification: [null, [Validators.required, Validators.min(1)]],
      plate:          [''],
    });
  }

  private loadPayMethods(): void {
    this.pmService.list().subscribe({
      next: (list) => { this.payMethods = (list ?? []).filter(p => p.active); },
      error: () => {}
    });
  }

  private loadOrders(): void {
    this.loadingOrders = true;
    this.woService.list().subscribe({
      next: (list) => { this.orders = list ?? []; this.loadingOrders = false; },
      error: ()    => { this.loadingOrders = false; }
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ── Generate ──────────────────────────────────────────────────────────────
  submitGenerate(): void {
    this.generateForm.markAllAsTouched();
    if (this.generateForm.invalid) return;

    this.saving = true;
    this.billing.generate(this.generateForm.value).subscribe({
      next: (bill) => {
        this.toast.success(`Factura ${bill.numBill} generada correctamente`);
        this.generatedBill = bill;
        this.saving = false;
        this.generateForm.reset({ createdBy: this.auth.getUsername() });
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al generar la factura');
        this.saving = false;
      }
    });
  }

  // ── Download PDF ──────────────────────────────────────────────────────────
  downloadPdf(bill: Bill, event?: Event): void {
    event?.stopPropagation();
    this.downloadingId = bill.id;
    this.billing.downloadPdf(bill.id).subscribe({
      next: (blob) => {
        this.billing.saveBlobAsPdf(blob, `factura-${bill.numBill}.pdf`);
        this.downloadingId = null;
        this.toast.success('Factura descargada correctamente');
      },
      error: () => {
        this.downloadingId = null;
        this.toast.error('Error al descargar la factura');
      }
    });
  }

  // ── Assign ────────────────────────────────────────────────────────────────
  openAssign(bill: Bill): void {
    this.assignBill = bill;
    this.assignForm.reset();
    this.showAssignModal = true;
  }

  closeAssign(): void { this.showAssignModal = false; this.assignBill = null; }

  submitAssign(): void {
    this.assignForm.markAllAsTouched();
    if (this.assignForm.invalid || !this.assignBill) return;

    this.assigning = true;
    const { identification, plate } = this.assignForm.value;
    this.billing.assign(this.assignBill.id, identification, plate).subscribe({
      next: () => {
        this.toast.success('Factura asignada correctamente');
        this.assigning = false;
        this.closeAssign();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al asignar la factura');
        this.assigning = false;
      }
    });
  }

  // ── Send proof ────────────────────────────────────────────────────────────
  openSend(bill: Bill): void {
    this.sendBill   = bill;
    this.selectedCanal = 'EMAIL';
    this.showSendModal = true;
  }

  closeSend(): void { this.showSendModal = false; this.sendBill = null; }

  submitSend(): void {
    if (!this.sendBill) return;
    this.sendingProof = true;
    this.billing.sendProof(this.sendBill.id, this.selectedCanal).subscribe({
      next: () => {
        this.toast.success('Comprobante enviado correctamente');
        this.sendingProof = false;
        this.closeSend();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al enviar el comprobante');
        this.sendingProof = false;
      }
    });
  }

  // ── History ───────────────────────────────────────────────────────────────
  searchHistory(): void {
    this.historyForm.markAllAsTouched();
    if (this.historyForm.invalid) return;

    this.loadingHistory = true;
    this.historySearched = false;
    const { identification, plate } = this.historyForm.value;
    this.billing.history(identification, plate || undefined).subscribe({
      next: (bills) => {
        this.historyBills   = bills ?? [];
        this.loadingHistory = false;
        this.historySearched = true;
      },
      error: () => {
        this.loadingHistory  = false;
        this.historySearched = true;
        this.toast.error('Error al buscar el historial');
      }
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      Pending:  'Pendiente',
      Paid:     'Pagado',
      Annulled: 'Anulado'
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending:  'badge--pending',
      Paid:     'badge--paid',
      Annulled: 'badge--annulled'
    };
    return map[status] ?? '';
  }
}