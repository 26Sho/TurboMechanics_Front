import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  GarantiasService, QualityCheck, QualityCheckItem,
  WorkOrderOption
} from '../../admin/service/garantias.service';
import { ToastService } from '../../../shared/services/toast.service';

type HttpErr = { error?: { message?: string } };

@Component({
  selector: 'app-garantias',
  templateUrl: './garantias.component.html',
  styleUrls: ['./garantias.component.scss']
})
export class GarantiasComponent implements OnInit {

  // ── DROPDOWN ──────────────────────────────────────────────────────────────
  workOrders: WorkOrderOption[] = [];
  loadingWorkOrders = false;

  // ── CONTROL DE CALIDAD (RF 8.14) ─────────────────────────────────────────
  qualitySearchForm!: FormGroup;
  qualityCheck: QualityCheck | null = null;
  loadingQuality = false;
  startingQuality = false;
  savingQuality = false;
  approvingQuality = false;
  rejectingQuality = false;
  rejectObservations = '';
  showRejectModal = false;

  constructor(
    private fb: FormBuilder,
    private svc: GarantiasService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadWorkOrders();
  }

  private loadWorkOrders(): void {
    this.loadingWorkOrders = true;
    this.svc.getWorkOrders().subscribe({
      next: (data: WorkOrderOption[]) => { this.workOrders = data; this.loadingWorkOrders = false; },
      error: () => { this.loadingWorkOrders = false; }
    });
  }

  private buildForms(): void {
    this.qualitySearchForm = this.fb.group({
      ordenId: [null, [Validators.required]]
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTROL DE CALIDAD (RF 8.14)
  // ─────────────────────────────────────────────────────────────────────────

  searchQualityCheck(): void {
    this.qualitySearchForm.markAllAsTouched();
    if (this.qualitySearchForm.invalid) return;
    this.loadingQuality = true;
    this.qualityCheck = null;
    this.svc.getQualityCheckByOrder(this.qualitySearchForm.value.ordenId).subscribe({
      next: (data: QualityCheck) => { this.qualityCheck = data; this.loadingQuality = false; },
      error: () => { this.loadingQuality = false; }
    });
  }

  startQualityCheck(): void {
    this.qualitySearchForm.markAllAsTouched();
    if (this.qualitySearchForm.invalid) return;
    this.startingQuality = true;
    this.svc.startQualityCheck(this.qualitySearchForm.value.ordenId).subscribe({
      next: (data: QualityCheck) => {
        this.qualityCheck = data;
        this.startingQuality = false;
        this.toast.success('Control de calidad iniciado');
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al iniciar control');
        this.startingQuality = false;
      }
    });
  }

  toggleItem(item: { verified: boolean; observation?: string }): void {
    item.verified = !item.verified;
  }

  saveQualityItems(): void {
    if (!this.qualityCheck) return;
    this.savingQuality = true;
    const items = this.qualityCheck.items.map((i: QualityCheckItem) => ({
      itemId: i.id,
      verified: i.verified,
      observation: i.observation
    }));
    this.svc.updateQualityCheck(this.qualityCheck.id, {
      workOrderId: this.qualityCheck.workOrderId,
      observations: this.qualityCheck.observations,
      items
    }).subscribe({
      next: (data: QualityCheck) => {
        this.qualityCheck = data;
        this.savingQuality = false;
        this.toast.success('Ítems actualizados');
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al guardar ítems');
        this.savingQuality = false;
      }
    });
  }

  approveQualityCheck(): void {
    if (!this.qualityCheck) return;
    this.approvingQuality = true;
    this.svc.approveQualityCheck(this.qualityCheck.id).subscribe({
      next: (data: QualityCheck) => {
        this.qualityCheck = data;
        this.approvingQuality = false;
        this.toast.success('Control de calidad aprobado');
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al aprobar');
        this.approvingQuality = false;
      }
    });
  }

  openRejectModal(): void {
    this.rejectObservations = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (!this.qualityCheck) return;
    this.rejectingQuality = true;
    this.svc.rejectQualityCheck(this.qualityCheck.id, this.rejectObservations).subscribe({
      next: (data: QualityCheck) => {
        this.qualityCheck = data;
        this.rejectingQuality = false;
        this.showRejectModal = false;
        this.toast.success('Control de calidad rechazado');
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al rechazar');
        this.rejectingQuality = false;
      }
    });
  }

  qualityProgress(): number {
    if (!this.qualityCheck || !this.qualityCheck.totalItems) return 0;
    return Math.round((this.qualityCheck.verifiedItems / this.qualityCheck.totalItems) * 100);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVA: 'badge--active', VENCIDA: 'badge--expired', CERRADA: 'badge--closed',
      VIGENTE: 'badge--active', EN_PROCESO: 'badge--process',
      COMPLETADO: 'badge--completed', APROBADO: 'badge--active', RECHAZADO: 'badge--expired'
    };
    return map[status] ?? '';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVA: 'Activa', VENCIDA: 'Vencida', CERRADA: 'Cerrada',
      VIGENTE: 'Vigente', EN_PROCESO: 'En proceso',
      COMPLETADO: 'Completado', APROBADO: 'Aprobado', RECHAZADO: 'Rechazado'
    };
    return map[status] ?? status;
  }
}