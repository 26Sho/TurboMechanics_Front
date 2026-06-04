import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MaintenanceTrackingService,
  MaintenanceStatusResponse,
  Issue,
  MaintenanceProgress
} from '../../../admin/service/maintenance-tracking.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WorkEvidenceService, WorkEvidenceResponse } from '../../../admin/service/work-evidence.service';

type TabType = 'status' | 'progress' | 'issues' | 'evidencias';

export interface WorkOrderOption {
  id:          number;
  numberorder: string;
  vehicleplate: string;
  stateorder:  string;
}

@Component({
  selector: 'app-mechanic-maintenance',
  templateUrl: './mechanic-maintenance.component.html',
  styleUrls: ['./mechanic-maintenance.component.scss']
})
export class MechanicMaintenanceComponent implements OnInit {

  activeTab: TabType = 'status';

  // ── Selector de orden ──────────────────────────────────────────────────────
  orders: WorkOrderOption[] = [];
  loadingOrders = false;
  selectedOrderId: number | null = null;

  // ── Estado de la orden ────────────────────────────────────────────────────
  status: MaintenanceStatusResponse | null = null;
  loadingStatus  = false;
  statusSearched = false;

  // ── HU 9.4 Registro de tiempos ────────────────────────────────────────────
  timeForm!: FormGroup;
  savingTime = false;

  // ── HU 9.7 Avances ────────────────────────────────────────────────────────
  progressForm!: FormGroup;
  progresses: MaintenanceProgress[] = [];
  loadingProgress = false;
  savingProgress  = false;

  // ── HU 9.6 Inconvenientes ─────────────────────────────────────────────────
  issueForm!: FormGroup;
  issues: Issue[] = [];
  loadingIssues = false;
  savingIssue   = false;
  closingIssueId: number | null = null;

  // ── HU 8.5 Evidencias ─────────────────────────────────────────────────────
  evidences: WorkEvidenceResponse[] = [];
  loadingEvidences = false;
  uploadingEvidence = false;
  deletingEvidenceId: number | null = null;
  selectedFile: File | null = null;
  evidenceDescription = '';
  evidenceFilterType = '';
  lightboxUrl: string | null = null;
  lightboxMime: string | null = null;

  private readonly ordersUrl = 'http://localhost:9090/orders';

  constructor(
    private fb:              FormBuilder,
    private service:         MaintenanceTrackingService,
    private toast:           ToastService,
    private auth:            AuthService,
    private http:            HttpClient,
    private evidenceService: WorkEvidenceService
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadOrders();
  }

  private buildForms(): void {
    this.timeForm = this.fb.group({
      estimatedDelivery: ['', Validators.required],
    });

    this.progressForm = this.fb.group({
      description: ['', Validators.required],
    });

    this.issueForm = this.fb.group({
      description: ['', Validators.required],
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ── Cargar todas las órdenes ───────────────────────────────────────────────
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadOrders(): void {
    this.loadingOrders = true;
    this.http.get<WorkOrderOption[]>(this.ordersUrl, { headers: this.getHeaders() }).subscribe({
      next: (list) => {
        // Filtra solo órdenes activas (excluye ENTREGADO y CANCELADO)
        this.orders = (list ?? []).filter(o =>
          o.stateorder !== 'ENTREGADO' && o.stateorder !== 'CANCELADO'
        );
        this.loadingOrders = false;
      },
      error: () => {
        this.loadingOrders = false;
        this.toast.error('Error al cargar las órdenes de trabajo');
      }
    });
  }

  // ── Seleccionar orden y cargar estado ─────────────────────────────────────
  onOrderSelect(): void {
    if (!this.selectedOrderId) return;
    this.loadingStatus  = true;
    this.statusSearched = false;
    this.status         = null;
    this.progresses     = [];
    this.issues         = [];

    this.service.getStatusById(this.selectedOrderId).subscribe({
      next: (data) => {
        this.status         = data;
        this.loadingStatus  = false;
        this.statusSearched = true;
        this.loadProgress();
        this.loadIssues();
        this.loadEvidences();
      },
      error: () => {
        this.loadingStatus  = false;
        this.statusSearched = true;
        this.toast.error('Error al cargar el estado de la orden');
      }
    });
  }

  stateLabel(state: string): string {
    const map: Record<string, string> = {
      RECIBIDO: 'Recibido', EN_DIAGNOSTICO: 'En diagnóstico',
      EN_REPARACION: 'En reparación', LISTO: 'Listo',
      ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
    };
    return map[state] ?? state;
  }

  stateClass(state: string): string {
    const map: Record<string, string> = {
      RECIBIDO: 'badge--scheduled', EN_DIAGNOSTICO: 'badge--reprogrammed',
      EN_REPARACION: 'badge--reprogrammed', LISTO: 'badge--completed',
      ENTREGADO: 'badge--completed', CANCELADO: 'badge--cancelled',
    };
    return map[state] ?? '';
  }

  issueClass(status: string): string {
    return status === 'Open' ? 'badge--reprogrammed' : 'badge--completed';
  }

  // ── HU 9.4 Actualizar tiempo estimado ─────────────────────────────────────
  updateTime(): void {
    this.timeForm.markAllAsTouched();
    if (this.timeForm.invalid || !this.status) return;
    this.savingTime = true;
    this.service.updateTime({
      workOrderId:       this.selectedOrderId!,
      estimatedDelivery: this.timeForm.value.estimatedDelivery,
    }).subscribe({
      next: () => {
        this.toast.success('Fecha estimada actualizada y cliente notificado');
        this.savingTime = false;
        this.timeForm.reset();
        this.onOrderSelect();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al actualizar la fecha');
        this.savingTime = false;
      }
    });
  }

  // ── HU 9.7 Avances ────────────────────────────────────────────────────────
  loadProgress(): void {
    this.loadingProgress = true;
    this.service.getProgress(this.selectedOrderId!).subscribe({
      next: (list) => { this.progresses = list ?? []; this.loadingProgress = false; },
      error: () => { this.loadingProgress = false; }
    });
  }

  submitProgress(): void {
    this.progressForm.markAllAsTouched();
    if (this.progressForm.invalid || !this.status) return;
    this.savingProgress = true;
    this.service.registerProgress({
      workOrderId:  this.selectedOrderId!,
      description:  this.progressForm.value.description,
      registeredBy: this.auth.getUsername(),
    }).subscribe({
      next: (p) => {
        this.progresses.push(p);
        this.toast.success('Avance registrado y cliente notificado');
        this.savingProgress = false;
        this.progressForm.reset();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al registrar el avance');
        this.savingProgress = false;
      }
    });
  }

  // ── HU 9.6 Inconvenientes ─────────────────────────────────────────────────
  loadIssues(): void {
    this.loadingIssues = true;
    this.service.getIssues(this.selectedOrderId!).subscribe({
      next: (list) => { this.issues = list ?? []; this.loadingIssues = false; },
      error: () => { this.loadingIssues = false; }
    });
  }

  submitIssue(): void {
    this.issueForm.markAllAsTouched();
    if (this.issueForm.invalid || !this.status) return;
    this.savingIssue = true;
    this.service.reportIssue({
      workOrderId:  this.selectedOrderId!,
      description:  this.issueForm.value.description,
      reportedBy:   this.auth.getUsername(),
    }).subscribe({
      next: (i) => {
        this.issues.unshift(i);
        this.toast.success('Inconveniente registrado y cliente notificado');
        this.savingIssue = false;
        this.issueForm.reset();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al registrar el inconveniente');
        this.savingIssue = false;
      }
    });
  }

  closeIssue(issue: Issue): void {
    this.closingIssueId = issue.id;
    this.service.closeIssue(issue.id).subscribe({
      next: (updated) => {
        const idx = this.issues.findIndex(i => i.id === updated.id);
        if (idx !== -1) this.issues[idx] = updated;
        this.toast.success('Inconveniente cerrado');
        this.closingIssueId = null;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al cerrar el inconveniente');
        this.closingIssueId = null;
      }
    });
  }

  // ── HU 8.5 Evidencias ─────────────────────────────────────────────────────

  loadEvidences(): void {
    if (!this.selectedOrderId) return;
    this.loadingEvidences = true;
    this.evidenceService.getEvidences(
      this.selectedOrderId,
      this.evidenceFilterType || undefined
    ).subscribe({
      next: (list) => { this.evidences = list ?? []; this.loadingEvidences = false; },
      error: () => { this.loadingEvidences = false; this.toast.error('Error al cargar evidencias'); }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadEvidence(): void {
    if (!this.selectedFile || !this.selectedOrderId) return;
    this.uploadingEvidence = true;
    this.evidenceService.uploadEvidence(
      this.selectedOrderId,
      this.selectedFile,
      this.evidenceDescription || undefined
    ).subscribe({
      next: (ev) => {
        this.evidences.unshift(ev);
        this.toast.success('Evidencia subida correctamente');
        this.uploadingEvidence = false;
        this.selectedFile = null;
        this.evidenceDescription = '';
        const input = document.getElementById('evidenceFileInput') as HTMLInputElement;
        if (input) input.value = '';
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al subir la evidencia');
        this.uploadingEvidence = false;
      }
    });
  }

  deleteEvidence(id: number): void {
    if (!confirm('¿Eliminar esta evidencia?')) return;
    this.deletingEvidenceId = id;
    this.evidenceService.deleteEvidence(id).subscribe({
      next: () => {
        this.evidences = this.evidences.filter(e => e.id !== id);
        this.toast.success('Evidencia eliminada');
        this.deletingEvidenceId = null;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al eliminar evidencia');
        this.deletingEvidenceId = null;
      }
    });
  }

  onFilterChange(): void {
    this.loadEvidences();
  }

  openLightbox(ev: WorkEvidenceResponse): void {
    this.lightboxUrl  = ev.fileUrl;
    this.lightboxMime = ev.mimeType;
  }

  closeLightbox(): void {
    this.lightboxUrl  = null;
    this.lightboxMime = null;
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  isImage(ev: WorkEvidenceResponse): boolean {
    return ev.evidenceType === 'IMAGEN';
  }

  isVideo(ev: WorkEvidenceResponse): boolean {
    return ev.evidenceType === 'VIDEO';
  }
}