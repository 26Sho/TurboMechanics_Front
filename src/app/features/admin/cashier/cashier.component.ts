import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BillingService } from '../service/billing.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Bill, CashierResponse } from '../../../core/models/billing.model';

type TabType = 'cashier' | 'report';

@Component({
  selector: 'app-cashier',
  templateUrl: './cashier.component.html',
  styleUrls: ['./cashier.component.scss']
})
export class CashierComponent implements OnInit {

  activeTab: TabType = 'cashier';

  // ── Caja ─────────────────────────────────────────────────────────────────
  cashierForm!: FormGroup;
  cashierData: CashierResponse | null = null;
  loadingCashier = false;
  cashierSearched = false;
  exportingExcel = false;

  // ── Reporte ───────────────────────────────────────────────────────────────
  reportForm!: FormGroup;
  reportBills: Bill[] = [];
  loadingReport = false;
  reportSearched = false;
  downloadingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private billing: BillingService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.buildForms();
  }

  private buildForms(): void {
    this.cashierForm = this.fb.group({
      start: ['', Validators.required],
      end: ['', Validators.required],
    });

    this.reportForm = this.fb.group({
      start: ['', Validators.required],
      end: ['', Validators.required],
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ── Caja ──────────────────────────────────────────────────────────────────
  searchCashier(): void {
    this.cashierForm.markAllAsTouched();
    if (this.cashierForm.invalid) return;

    this.loadingCashier = true;
    this.cashierSearched = false;
    this.cashierData = null;

    const { start, end } = this.cashierForm.value;
    this.billing.cashier(start, end).subscribe({
      next: (data) => {
        this.cashierData = data;
        this.loadingCashier = false;
        this.cashierSearched = true;
      },
      error: () => {
        this.loadingCashier = false;
        this.cashierSearched = true;
        this.toast.error('Error al obtener el control de caja');
      }
    });
  }

  // ── Reporte ───────────────────────────────────────────────────────────────
  searchReport(): void {
    this.reportForm.markAllAsTouched();
    if (this.reportForm.invalid) return;

    this.loadingReport = true;
    this.reportSearched = false;
    this.reportBills = [];

    const { start, end } = this.reportForm.value;
    this.billing.report(start, end).subscribe({
      next: (bills) => {
        this.reportBills = bills ?? [];
        this.loadingReport = false;
        this.reportSearched = true;
      },
      error: () => {
        this.loadingReport = false;
        this.reportSearched = true;
        this.toast.error('Error al obtener el reporte');
      }
    });
  }

  downloadPdf(bill: Bill): void {
    this.downloadingId = bill.id;
    this.billing.downloadPdf(bill.id).subscribe({
      next: (blob) => {
        this.billing.saveBlobAsPdf(blob, `factura-${bill.numBill}.pdf`);
        this.downloadingId = null;
        this.toast.success('Factura descargada');
      },
      error: () => {
        this.downloadingId = null;
        this.toast.error('Error al descargar');
      }
    });
  }

  get totalFacturas(): number {
    return this.reportBills.reduce((sum, b) => sum + b.total, 0);
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      Pending: 'Pendiente', Paid: 'Pagado', Annulled: 'Anulado'
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'badge--pending', Paid: 'badge--paid', Annulled: 'badge--annulled'
    };
    return map[status] ?? '';
  }

  balanceClass(): string {
    if (!this.cashierData) return '';
    return this.cashierData.balance >= 0 ? 'positive' : 'negative';
  }

  exportExcel(): void {
    if (!this.cashierData) return;
    this.exportingExcel = true;
    const { start, end } = this.cashierForm.value;
    this.billing.exportCashier(start, end).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `caja-${start}-${end}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exportingExcel = false;
        this.toast.success('Excel descargado correctamente');
      },
      error: () => {
        this.exportingExcel = false;
        this.toast.error('Error al exportar Excel');
      }
    });
  }
}