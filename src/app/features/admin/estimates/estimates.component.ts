import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EstimateService, Estimate, SentEstimateRequest } from '../service/estimate.service';
import { WorkOrderService } from '../../../core/services/work-order.service';
import { ToastService } from '../../../shared/services/toast.service';
import { WorkOrderResponse } from '../../../core/models/work-order';

type TabType = 'send' | 'list';

@Component({
  selector: 'app-estimates',
  templateUrl: './estimates.component.html',
  styleUrls: ['./estimates.component.scss']
})
export class EstimatesComponent implements OnInit {

  activeTab: TabType = 'send';

  // ── Send form ─────────────────────────────────────────────────────────────
  sendForm!:   FormGroup;
  saving       = false;
  orders:      WorkOrderResponse[] = [];

  // ── List ──────────────────────────────────────────────────────────────────
  listForm!:   FormGroup;
  estimates:   Estimate[] = [];
  loading      = false;
  searched     = false;

  // ── Response ──────────────────────────────────────────────────────────────
  respondingId: number | null = null;

  constructor(
    private fb:           FormBuilder,
    private estService:   EstimateService,
    private woService:    WorkOrderService,
    private toast:        ToastService
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadOrders();
  }

  private buildForms(): void {
    this.sendForm = this.fb.group({
      workOrderId:    [null, Validators.required],
      identification: [null, [Validators.required, Validators.min(1)]],
      plate:          ['',   Validators.required],
      description:     ['',   Validators.required],
      totalEstimate:  [null, [Validators.required, Validators.min(1)]],
      canal:          ['EMAIL', Validators.required],
    });

    this.listForm = this.fb.group({
      identification: [null, [Validators.required, Validators.min(1)]],
      plate:          [''],
    });
  }

  private loadOrders(): void {
    this.woService.list().subscribe({
      next: (list) => { this.orders = list ?? []; },
      error: () => {}
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  submitSend(): void {
    this.sendForm.markAllAsTouched();
    if (this.sendForm.invalid) return;

    this.saving = true;
    const v = this.sendForm.value;

    const payload: SentEstimateRequest = {
      workOrderId:    v.workOrderId,
      identification: v.identification,
      plate:          v.plate.toUpperCase(),
      description:    v.description,
      totalEstimate:  v.totalEstimate,
      canal:          v.canal,
    };

    this.estService.send(payload).subscribe({
      next: () => {
        this.toast.success('Presupuesto enviado correctamente');
        this.saving = false;
        this.sendForm.reset({ canal: 'EMAIL' });
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al enviar el presupuesto');
        this.saving = false;
      }
    });
  }

  // ── List ──────────────────────────────────────────────────────────────────
  searchEstimates(): void {
    this.listForm.markAllAsTouched();
    if (this.listForm.invalid) return;

    this.loading  = true;
    this.searched = false;
    const { identification, plate } = this.listForm.value;

    this.estService.list(identification, plate || undefined).subscribe({
      next: (list) => {
        this.estimates = list ?? [];
        this.loading   = false;
        this.searched  = true;
      },
      error: () => {
        this.loading  = false;
        this.searched = true;
        this.toast.error('Error al buscar presupuestos');
      }
    });
  }

  // ── Response ──────────────────────────────────────────────────────────────
  respond(estimate: Estimate, approved: boolean): void {
    this.respondingId = estimate.id;
    this.estService.response(estimate.id, approved).subscribe({
      next: (updated) => {
        const idx = this.estimates.findIndex(e => e.id === estimate.id);
        if (idx !== -1) this.estimates[idx] = updated;
        this.toast.success(approved ? 'Presupuesto aprobado' : 'Presupuesto rechazado');
        this.respondingId = null;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al registrar respuesta');
        this.respondingId = null;
      }
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      SENT: 'Enviado', APPROVED: 'Aprobado', REJECTED: 'Rechazado'
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      SENT: 'badge--sent', APPROVED: 'badge--approved', REJECTED: 'badge--rejected'
    };
    return map[status] ?? '';
  }

  canRespond(estimate: Estimate): boolean {
    return estimate.statusEstimate === 'SENT';
  }
}