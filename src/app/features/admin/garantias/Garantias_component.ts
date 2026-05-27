import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  GarantiasService, Warranty, WarrantyValidation, Workshop, QualityCheck, QualityCheckItem, WorkEvidence
} from '../service/garantias.service';
import { ToastService } from '../../../shared/services/toast.service';

type TabType = 'garantias' | 'talleres' | 'calidad' | 'evidencias';
type HttpErr = { error?: { message?: string } };

interface WorkEvidenceWithPreview extends WorkEvidence {
  previewUrl?: SafeUrl;
  rawUrl?: string;
}

@Component({
  selector: 'app-garantias',
  templateUrl: './garantias.component.html',
  styleUrls: ['./garantias.component.scss']
})
export class GarantiasComponent implements OnInit {

  activeTab: TabType = 'garantias';

  // ── GARANTÍAS ─────────────────────────────────────────────────────────────
  warrantyForm!: FormGroup;
  closeForm!: FormGroup;
  historyForm!: FormGroup;
  validateForm!: FormGroup;

  warranties: Warranty[] = [];
  historyList: Warranty[] = [];
  validations: WarrantyValidation[] = [];
  selectedWarranty: Warranty | null = null;
  lastValidation: WarrantyValidation | null = null;

  loadingWarranties = false;
  savingWarranty = false;
  closingWarranty = false;
  generatingVoucher = false;
  loadingHistory = false;
  validating = false;
  loadingValidations = false;

  warrantySearchTerm = '';
  showWarrantyForm = false;
  editingWarranty: Warranty | null = null;
  showCloseModal = false;
  showValidateModal = false;
  showValidationsModal = false;

  // ── TALLERES ──────────────────────────────────────────────────────────────
  workshopForm!: FormGroup;
  workshops: Workshop[] = [];
  loadingWorkshops = false;
  savingWorkshop = false;
  workshopCity = '';
  editingWorkshop: Workshop | null = null;
  showWorkshopForm = false;
  deletingWorkshopId: number | null = null;

  // ── CONTROL DE CALIDAD ────────────────────────────────────────────────────
  qualitySearchForm!: FormGroup;
  qualityCheck: QualityCheck | null = null;
  loadingQuality = false;
  startingQuality = false;
  savingQuality = false;
  approvingQuality = false;
  rejectingQuality = false;
  rejectObservations = '';
  showRejectModal = false;

  // ── EVIDENCIAS ────────────────────────────────────────────────────────────
  evidenceSearchForm!: FormGroup;
  evidences: WorkEvidenceWithPreview[] = [];
  loadingEvidences = false;
  uploadingEvidence = false;
  selectedFile: File | null = null;
  previewUrl: SafeUrl | null = null;
  imageModalUrl: SafeUrl | null = null;
  evidenceDescription = '';
  evidenceTipo = '';
  deletingEvidenceId: number | null = null;

  // Modal confirmar eliminar evidencia
  showDeleteEvidenceModal = false;
  pendingDeleteEvidenceId: number | null = null;

  // Modal confirmar eliminar taller
  showDeleteWorkshopModal = false;
  pendingDeleteWorkshopId: number | null = null;

  private previewCache: Map<number, SafeUrl> = new Map();

  constructor(
    private fb: FormBuilder,
    private svc: GarantiasService,
    private toast: ToastService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadWarranties();
    this.loadWorkshops();
  }

  private buildForms(): void {
    this.warrantyForm = this.fb.group({
      workOrderId:  [null, [Validators.required, Validators.min(1)]],
      serviceId:    [null],
      sparePartId:  [null],
      startDate:    ['', Validators.required],
      endDate:      ['', Validators.required],
      observations: ['']
    });
    this.closeForm = this.fb.group({
      closureReason: ['', Validators.required]
    });
    this.historyForm = this.fb.group({
      tipo:  ['cliente'],
      valor: ['', Validators.required]
    });
    this.validateForm = this.fb.group({
      warrantyId: [null, [Validators.required, Validators.min(1)]]
    });
    this.workshopForm = this.fb.group({
      name:      ['', Validators.required],
      address:   ['', Validators.required],
      city:      ['', Validators.required],
      state:     [''],
      phone:     [''],
      email:     [''],
      latitude:  [null, Validators.required],
      longitude: [null, Validators.required],
      schedule:  [''],
      active:    [true]
    });
    this.qualitySearchForm = this.fb.group({
      ordenId: [null, [Validators.required, Validators.min(1)]]
    });
    this.evidenceSearchForm = this.fb.group({
      ordenId: [null, [Validators.required, Validators.min(1)]]
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GARANTÍAS
  // ─────────────────────────────────────────────────────────────────────────

  loadWarranties(): void {
    this.loadingWarranties = true;
    const params = this.warrantySearchTerm ? { buscar: this.warrantySearchTerm } : {};
    this.svc.getWarranties(params).subscribe({
      next: (data: Warranty[]) => { this.warranties = data; this.loadingWarranties = false; },
      error: (_err: unknown) => { this.loadingWarranties = false; this.toast.error('Error al cargar garantías'); }
    });
  }

  openWarrantyForm(warranty?: Warranty): void {
    this.editingWarranty = warranty || null;
    if (warranty) {
      this.warrantyForm.patchValue({
        workOrderId: warranty.workOrderId,
        serviceId: warranty.serviceId,
        sparePartId: warranty.sparePartId,
        startDate: warranty.startDate,
        endDate: warranty.endDate,
        observations: warranty.observations
      });
    } else {
      this.warrantyForm.reset();
    }
    this.showWarrantyForm = true;
  }

  closeWarrantyFormPanel(): void {
    this.showWarrantyForm = false;
    this.editingWarranty = null;
    this.warrantyForm.reset();
  }

  submitWarranty(): void {
    this.warrantyForm.markAllAsTouched();
    const v = this.warrantyForm.value;
    if (!v.serviceId && !v.sparePartId) {
      this.toast.error('Debe asociar la garantía a un servicio o a un repuesto');
      return;
    }
    if (this.warrantyForm.invalid) return;
    this.savingWarranty = true;
    const req$ = this.editingWarranty
      ? this.svc.updateWarranty(this.editingWarranty.id, v)
      : this.svc.registerWarranty(v);
    req$.subscribe({
      next: (_res: Warranty) => {
        this.toast.success(this.editingWarranty ? 'Garantía actualizada' : 'Garantía registrada');
        this.savingWarranty = false;
        this.closeWarrantyFormPanel();
        this.loadWarranties();
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al guardar garantía');
        this.savingWarranty = false;
      }
    });
  }

  openCloseModal(w: Warranty): void {
    this.selectedWarranty = w;
    this.closeForm.reset();
    this.showCloseModal = true;
  }

  submitClose(): void {
    this.closeForm.markAllAsTouched();
    if (this.closeForm.invalid || !this.selectedWarranty) return;
    this.closingWarranty = true;
    this.svc.closeWarranty(this.selectedWarranty.id, this.closeForm.value).subscribe({
      next: (_res: Warranty) => {
        this.toast.success('Garantía cerrada correctamente');
        this.closingWarranty = false;
        this.showCloseModal = false;
        this.loadWarranties();
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al cerrar garantía');
        this.closingWarranty = false;
      }
    });
  }

  downloadVoucher(w: Warranty): void {
    this.generatingVoucher = true;
    this.svc.generateVoucher(w.id).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobante-garantia-${w.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.generatingVoucher = false;
        this.toast.success('Comprobante descargado');
      },
      error: (_err: unknown) => { this.toast.error('Error al generar comprobante'); this.generatingVoucher = false; }
    });
  }

  searchHistory(): void {
    this.historyForm.markAllAsTouched();
    if (this.historyForm.invalid) return;
    this.loadingHistory = true;
    const { tipo, valor } = this.historyForm.value;
    const params = tipo === 'cliente' ? { cliente: valor } : { vehiculo: valor };
    this.svc.getHistory(params).subscribe({
      next: (data: Warranty[]) => { this.historyList = data; this.loadingHistory = false; },
      error: (_err: unknown) => { this.loadingHistory = false; this.toast.error('Error al cargar historial'); }
    });
  }

  validateWarranty(): void {
    this.validateForm.markAllAsTouched();
    if (this.validateForm.invalid) return;
    this.validating = true;
    this.svc.validateWarranty(this.validateForm.value.warrantyId).subscribe({
      next: (v: WarrantyValidation) => {
        this.lastValidation = v;
        this.validating = false;
        this.toast.success('Validación realizada');
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al validar');
        this.validating = false;
      }
    });
  }

  openValidationsModal(w: Warranty): void {
    this.selectedWarranty = w;
    this.loadingValidations = true;
    this.showValidationsModal = true;
    this.validations = [];
    this.svc.getValidationHistory(w.id).subscribe({
      next: (data: WarrantyValidation[]) => { this.validations = data; this.loadingValidations = false; },
      error: (_err: unknown) => { this.loadingValidations = false; this.toast.error('Error al cargar validaciones'); }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TALLERES
  // ─────────────────────────────────────────────────────────────────────────

  loadWorkshops(): void {
    this.loadingWorkshops = true;
    this.svc.getWorkshops(this.workshopCity || undefined).subscribe({
      next: (data: Workshop[]) => { this.workshops = data; this.loadingWorkshops = false; },
      error: (_err: unknown) => { this.loadingWorkshops = false; this.toast.error('Error al cargar talleres'); }
    });
  }

  openWorkshopForm(w?: Workshop): void {
    this.editingWorkshop = w || null;
    if (w) { this.workshopForm.patchValue(w); } else { this.workshopForm.reset({ active: true }); }
    this.showWorkshopForm = true;
  }

  closeWorkshopForm(): void {
    this.showWorkshopForm = false;
    this.editingWorkshop = null;
    this.workshopForm.reset({ active: true });
  }

  submitWorkshop(): void {
    this.workshopForm.markAllAsTouched();
    if (this.workshopForm.invalid) return;
    this.savingWorkshop = true;
    const req$ = this.editingWorkshop
      ? this.svc.updateWorkshop(this.editingWorkshop.id, this.workshopForm.value)
      : this.svc.registerWorkshop(this.workshopForm.value);
    req$.subscribe({
      next: (_res: Workshop) => {
        this.toast.success(this.editingWorkshop ? 'Taller actualizado' : 'Taller registrado');
        this.savingWorkshop = false;
        this.closeWorkshopForm();
        this.loadWorkshops();
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al guardar taller');
        this.savingWorkshop = false;
      }
    });
  }

  // Abre el modal de confirmación para eliminar taller
  confirmDeleteWorkshop(id: number): void {
    this.pendingDeleteWorkshopId = id;
    this.showDeleteWorkshopModal = true;
  }

  cancelDeleteWorkshop(): void {
    this.pendingDeleteWorkshopId = null;
    this.showDeleteWorkshopModal = false;
  }

  deleteWorkshop(): void {
    if (this.pendingDeleteWorkshopId === null) return;
    const id = this.pendingDeleteWorkshopId;
    this.deletingWorkshopId = id;
    this.showDeleteWorkshopModal = false;
    this.pendingDeleteWorkshopId = null;
    this.svc.deleteWorkshop(id).subscribe({
      next: (_res: unknown) => {
        this.toast.success('Taller eliminado');
        this.deletingWorkshopId = null;
        this.loadWorkshops();
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al eliminar taller');
        this.deletingWorkshopId = null;
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTROL DE CALIDAD
  // ─────────────────────────────────────────────────────────────────────────

  searchQualityCheck(): void {
    this.qualitySearchForm.markAllAsTouched();
    if (this.qualitySearchForm.invalid) return;
    this.loadingQuality = true;
    this.qualityCheck = null;
    this.svc.getQualityCheckByOrder(this.qualitySearchForm.value.ordenId).subscribe({
      next: (data: QualityCheck) => { this.qualityCheck = data; this.loadingQuality = false; },
      error: (_err: unknown) => { this.loadingQuality = false; }
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

  // ─────────────────────────────────────────────────────────────────────────
  // EVIDENCIAS
  // ─────────────────────────────────────────────────────────────────────────

  loadEvidences(): void {
    this.evidenceSearchForm.markAllAsTouched();
    if (this.evidenceSearchForm.invalid) return;
    this.loadingEvidences = true;
    this.evidences = [];
    this.svc.getEvidences(this.evidenceSearchForm.value.ordenId, this.evidenceTipo || undefined).subscribe({
      next: (data: WorkEvidence[]) => {
        this.evidences = data.map(e => ({
          ...e,
          previewUrl: e.fileUrl ? this.sanitizer.bypassSecurityTrustUrl(e.fileUrl) : this.previewCache.get(e.id),
          rawUrl: e.fileUrl
        }));
        this.loadingEvidences = false;
      },
      error: (_err: unknown) => { this.loadingEvidences = false; this.toast.error('Error al cargar evidencias'); }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
    this.previewUrl = null;
    if (this.selectedFile && this.selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => { this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(e.target?.result as string); };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadEvidence(): void {
    if (!this.selectedFile || this.evidenceSearchForm.invalid) {
      this.evidenceSearchForm.markAllAsTouched();
      if (!this.selectedFile) this.toast.error('Selecciona un archivo');
      return;
    }
    this.uploadingEvidence = true;
    const savedPreview = this.previewUrl;
    this.svc.uploadEvidence(this.evidenceSearchForm.value.ordenId, this.selectedFile, this.evidenceDescription).subscribe({
      next: (res: WorkEvidence) => {
        this.toast.success('Evidencia adjuntada');
        this.uploadingEvidence = false;
        this.selectedFile = null;
        this.previewUrl = null;
        this.evidenceDescription = '';
        if (savedPreview && res.id) {
          this.previewCache.set(res.id, savedPreview);
        }
        // Clear cache for this id so fresh URL from server is used on reload
        this.loadEvidences();
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al subir evidencia');
        this.uploadingEvidence = false;
      }
    });
  }

  // Abre el modal de confirmación para eliminar evidencia
  confirmDeleteEvidence(id: number): void {
    this.pendingDeleteEvidenceId = id;
    this.showDeleteEvidenceModal = true;
  }

  cancelDeleteEvidence(): void {
    this.pendingDeleteEvidenceId = null;
    this.showDeleteEvidenceModal = false;
  }

  deleteEvidence(): void {
    if (this.pendingDeleteEvidenceId === null) return;
    const id = this.pendingDeleteEvidenceId;
    this.deletingEvidenceId = id;
    this.showDeleteEvidenceModal = false;
    this.pendingDeleteEvidenceId = null;
    this.svc.deleteEvidence(id).subscribe({
      next: (_res: unknown) => {
        this.toast.success('Evidencia eliminada');
        this.previewCache.delete(id);
        this.deletingEvidenceId = null;
        this.loadEvidences();
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al eliminar evidencia');
        this.deletingEvidenceId = null;
      }
    });
  }

  openImageModal(url: string | SafeUrl): void {
    this.imageModalUrl = typeof url === 'string' ? this.sanitizer.bypassSecurityTrustUrl(url) : url;
  }
  closeImageModal(): void { this.imageModalUrl = null; }

  fileSizeLabel(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

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