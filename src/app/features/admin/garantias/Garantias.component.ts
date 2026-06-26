import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  GarantiasService, Warranty, WarrantyValidation, Workshop, QualityCheck, QualityCheckItem, WorkEvidence,
  WorkOrderOption, ServiceOption, SparePartOption
} from '../service/garantias.service';
import { ToastService } from '../../../shared/services/toast.service';

declare const google: any;

type TabType = 'garantias' | 'talleres' | 'calidad' | 'evidencias';
type HttpErr = { error?: { message?: string } };

interface WorkEvidenceWithPreview extends WorkEvidence {
  previewUrl?: SafeUrl;
  rawUrl?: string;
}

// ⚠️ API key de Google Maps pegada directo en el código (decisión del equipo).
// Debe tener "Maps JavaScript API" habilitada en Google Cloud Console.
const GOOGLE_MAPS_API_KEY = 'AIzaSyCRNfERJjshgPygGis2vchgLSebEWLsrwY';

@Component({
  standalone: false,
  selector: 'app-garantias',
  templateUrl: './garantias.component.html',
  styleUrls: ['./garantias.component.scss']
})
export class GarantiasComponent implements OnInit {

  // Contenedor del mapa de talleres, dentro del mismo card (solo existe
  // cuando activeTab === 'talleres' y hay talleres cargados).
  @ViewChild('workshopsMapContainer') workshopsMapContainer?: ElementRef<HTMLDivElement>;

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

  // ── DROPDOWNS ─────────────────────────────────────────────────────────────
  workOrders: WorkOrderOption[] = [];
  serviceCatalog: ServiceOption[] = [];
  spareParts: SparePartOption[] = [];
  loadingWorkOrders = false;
  loadingServiceCatalog = false;
  loadingSpareParts = false;

  // Selección múltiple de servicios/repuestos al REGISTRAR una garantía nueva
  selectedServiceIds: number[] = [];
  selectedSparePartIds: number[] = [];
  serviceSearchTerm = '';
  sparePartSearchTerm = '';
  showServiceDropdown = false;
  showSparePartDropdown = false;

  // ── TALLERES ──────────────────────────────────────────────────────────────
  workshopForm!: FormGroup;
  workshops: Workshop[] = [];
  loadingWorkshops = false;
  savingWorkshop = false;
  workshopCity = '';
  editingWorkshop: Workshop | null = null;
  showWorkshopForm = false;
  deletingWorkshopId: number | null = null;

  // Estado del mapa de talleres (Google Maps)
  workshopsMapError = false;
  private workshopsMap: any;
  private workshopsMarkers: any[] = [];
  private workshopsMapReady = false;
  private static googleMapsLoadingPromise: Promise<void> | null = null;

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

  showDeleteEvidenceModal = false;
  pendingDeleteEvidenceId: number | null = null;

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
    this.loadDropdownData();
  }

  private loadDropdownData(): void {
    this.loadingWorkOrders = true;
    this.svc.getWorkOrders().subscribe({
      next: (data: WorkOrderOption[]) => { this.workOrders = data; this.loadingWorkOrders = false; },
      error: () => { this.loadingWorkOrders = false; }
    });

    this.loadingServiceCatalog = true;
    this.svc.getServiceCatalog().subscribe({
      next: (data: ServiceOption[]) => { this.serviceCatalog = data; this.loadingServiceCatalog = false; },
      error: () => { this.loadingServiceCatalog = false; }
    });

    this.loadingSpareParts = true;
    this.svc.getSpareParts().subscribe({
      next: (data: SparePartOption[]) => { this.spareParts = data; this.loadingSpareParts = false; },
      error: () => { this.loadingSpareParts = false; }
    });
  }

  private buildForms(): void {
    this.warrantyForm = this.fb.group({
      workOrderId:  [null, [Validators.required]],
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
      warrantyId: [null, [Validators.required]]
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
      ordenId: [null, [Validators.required]]
    });
    this.evidenceSearchForm = this.fb.group({
      ordenId: [null, [Validators.required]]
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NAVEGACIÓN DE TABS
  // ─────────────────────────────────────────────────────────────────────────

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
    if (tab === 'talleres') {
      // El contenedor del mapa se destruye/recrea con cada *ngIf, así que
      // hay que esperar al siguiente ciclo de render para volver a pintarlo.
      setTimeout(() => this.tryRenderWorkshopsMap(), 0);
    }
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
    this.serviceSearchTerm = '';
    this.sparePartSearchTerm = '';
    this.showServiceDropdown = false;
    this.showSparePartDropdown = false;
    if (warranty) {
      this.selectedServiceIds = (warranty.services || []).map(s => s.id);
      this.selectedSparePartIds = (warranty.spareParts || [])
        .filter(p => !p.deleted && p.id != null)
        .map(p => p.id as number);
      this.warrantyForm.patchValue({
        workOrderId: warranty.workOrderId,
        startDate: warranty.startDate,
        endDate: warranty.endDate,
        observations: warranty.observations
      });
    } else {
      this.selectedServiceIds = [];
      this.selectedSparePartIds = [];
      this.warrantyForm.reset();
    }
    this.showWarrantyForm = true;
  }

  toggleServiceSelection(id: number): void {
    const idx = this.selectedServiceIds.indexOf(id);
    if (idx >= 0) this.selectedServiceIds.splice(idx, 1);
    else this.selectedServiceIds.push(id);
  }

  toggleSparePartSelection(id: number): void {
    const idx = this.selectedSparePartIds.indexOf(id);
    if (idx >= 0) this.selectedSparePartIds.splice(idx, 1);
    else this.selectedSparePartIds.push(id);
  }

  isServiceSelected(id: number): boolean {
    return this.selectedServiceIds.includes(id);
  }

  isSparePartSelected(id: number): boolean {
    return this.selectedSparePartIds.includes(id);
  }

  get filteredServiceOptions(): ServiceOption[] {
    const term = this.serviceSearchTerm.trim().toLowerCase();
    return this.serviceCatalog.filter(s =>
      !this.isServiceSelected(s.id) &&
      (!term || s.name.toLowerCase().includes(term))
    );
  }

  get filteredSparePartOptions(): SparePartOption[] {
    const term = this.sparePartSearchTerm.trim().toLowerCase();
    return this.spareParts.filter(p =>
      !this.isSparePartSelected(p.id) &&
      (!term ||
        p.name.toLowerCase().includes(term) ||
        (p.reference && p.reference.toLowerCase().includes(term)))
    );
  }

  get selectedServiceOptions(): ServiceOption[] {
    return this.serviceCatalog.filter(s => this.isServiceSelected(s.id));
  }

  get selectedSparePartOptions(): SparePartOption[] {
    return this.spareParts.filter(p => this.isSparePartSelected(p.id));
  }

  toggleServiceDropdown(): void {
    this.showServiceDropdown = !this.showServiceDropdown;
    this.showSparePartDropdown = false;
  }

  toggleSparePartDropdown(): void {
    this.showSparePartDropdown = !this.showSparePartDropdown;
    this.showServiceDropdown = false;
  }

  closeDropdowns(): void {
    this.showServiceDropdown = false;
    this.showSparePartDropdown = false;
  }

  closeWarrantyFormPanel(): void {
    this.showWarrantyForm = false;
    this.editingWarranty = null;
    this.selectedServiceIds = [];
    this.selectedSparePartIds = [];
    this.serviceSearchTerm = '';
    this.sparePartSearchTerm = '';
    this.showServiceDropdown = false;
    this.showSparePartDropdown = false;
    this.warrantyForm.reset();
  }

  submitWarranty(): void {
    this.warrantyForm.markAllAsTouched();

    if (this.selectedServiceIds.length === 0 && this.selectedSparePartIds.length === 0) {
      this.toast.error('Debe seleccionar al menos un servicio o un repuesto');
      return;
    }
    if (this.warrantyForm.invalid) return;

    const payload = {
      ...this.warrantyForm.value,
      serviceIds: this.selectedServiceIds,
      sparePartIds: this.selectedSparePartIds
    };

    this.savingWarranty = true;
    const req$ = this.editingWarranty
      ? this.svc.updateWarranty(this.editingWarranty.id, payload)
      : this.svc.registerWarranty(payload);

    req$.subscribe({
      next: (_res: Warranty) => {
        this.toast.success(this.editingWarranty ? 'Garantía actualizada' : 'Garantía registrada');
        this.savingWarranty = false;
        this.closeWarrantyFormPanel();
        this.loadWarranties();
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al guardar la garantía');
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
      next: (data: Workshop[]) => {
        this.workshops = data;
        this.loadingWorkshops = false;
        if (this.activeTab === 'talleres') {
          setTimeout(() => this.tryRenderWorkshopsMap(), 0);
        }
      },
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

  // ── Mapa de talleres (Google Maps JS API), dentro del mismo card ─────────

  private loadGoogleMaps(): Promise<void> {
    if (typeof google !== 'undefined' && google.maps) {
      return Promise.resolve();
    }

    if (GarantiasComponent.googleMapsLoadingPromise) {
      return GarantiasComponent.googleMapsLoadingPromise;
    }

    GarantiasComponent.googleMapsLoadingPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null;
      if (existingScript) {
        if (typeof google !== 'undefined' && google.maps) {
          resolve();
        } else {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () => reject(new Error('Google Maps script failed to load')));
        }
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly`;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-google-maps', 'true');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google Maps script failed to load'));
      document.head.appendChild(script);
    });

    return GarantiasComponent.googleMapsLoadingPromise;
  }

  /** Intenta pintar el mapa: espera a que el contenedor exista en el DOM
   *  (puede no existir todavía si *ngIf aún no terminó de renderizar). */
  private tryRenderWorkshopsMap(): void {
    if (this.activeTab !== 'talleres' || this.loadingWorkshops || this.workshops.length === 0) {
      return;
    }
    if (!this.workshopsMapContainer) {
      // El contenedor todavía no está en el DOM; reintenta en el próximo tick.
      setTimeout(() => this.tryRenderWorkshopsMap(), 50);
      return;
    }

    this.loadGoogleMaps()
      .then(() => this.renderWorkshopsMap())
      .catch((err) => {
        console.error('No se pudo cargar Google Maps:', err);
        this.workshopsMapError = true;
      });
  }

  private renderWorkshopsMap(): void {
    if (typeof google === 'undefined' || !google.maps || !this.workshopsMapContainer) {
      this.workshopsMapError = true;
      return;
    }

    const el = this.workshopsMapContainer.nativeElement;

    if (!this.workshopsMap) {
      this.workshopsMap = new google.maps.Map(el, {
        center: { lat: 4.5339, lng: -75.6814 },
        zoom: 12,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: this.darkMapStyle()
      });
      this.workshopsMapReady = true;
    }

    // Redibuja marcadores con la lista actual de talleres
    this.workshopsMarkers.forEach(m => m.setMap(null));
    this.workshopsMarkers = [];

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    this.workshops.forEach(w => {
      if (w.latitude == null || w.longitude == null) return;
      hasPoints = true;

      const marker = new google.maps.Marker({
        position: { lat: w.latitude, lng: w.longitude },
        map: this.workshopsMap,
        title: w.name,
        icon: this.pinIcon(w.active ? '#F45D01' : '#6E6E6E', 28)
      });

      const info = new google.maps.InfoWindow({
        content: `
          <div style="font-family: sans-serif; max-width: 220px; color: #1a1a1a;">
            <strong style="color:#1a1a1a; font-size:14px;">${this.escapeHtml(w.name)}</strong><br>
            <span style="color:#3a3a3a;">${this.escapeHtml(w.address)}</span><br>
            <span style="color:#3a3a3a;">${this.escapeHtml(w.city)}${w.state ? ', ' + this.escapeHtml(w.state) : ''}</span><br>
            <span style="color:#3a3a3a;">Colombia</span>
            ${w.phone ? `<br><span style="color:#3a3a3a;">${this.escapeHtml(w.phone)}</span>` : ''}
            ${w.schedule ? `<br><span style="color:#3a3a3a;">${this.escapeHtml(w.schedule)}</span>` : ''}
            <br><span style="color:${w.active ? '#22C55E' : '#6E6E6E'}; font-weight:600;">
              ${w.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        `
      });
      marker.addListener('click', () => info.open(this.workshopsMap, marker));

      this.workshopsMarkers.push(marker);
      bounds.extend({ lat: w.latitude, lng: w.longitude });
    });

    if (hasPoints) {
      this.workshopsMap.fitBounds(bounds, 50);
    }

    // Si el card estaba oculto cuando se creó el mapa, Google Maps puede
    // quedarse con tiles a medio cargar; forzamos un resize.
    requestAnimationFrame(() => google.maps.event.trigger(this.workshopsMap, 'resize'));
  }

  private pinIcon(color: string, size: number): any {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
        <path fill="${color}" stroke="#ffffff" stroke-width="1.2"
          d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z"/>
        <circle cx="12" cy="10" r="3" fill="#ffffff"/>
      </svg>`;
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size)
    };
  }

  private darkMapStyle(): any[] {
    return [
      { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#cfcfcf' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2b2b2b' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
      { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#242424' }] },
      { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] }
    ];
  }

  private escapeHtml(value: string): string {
    if (!value) { return ''; }
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
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
        this.loadEvidences();
      },
      error: (err: HttpErr) => {
        this.toast.error(err.error?.message || 'Error al subir evidencia');
        this.uploadingEvidence = false;
      }
    });
  }

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