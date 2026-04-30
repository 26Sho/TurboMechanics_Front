import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/shared/services/toast.service';
import { WorkOrderService } from 'src/app/core/services/work-order.service';
import { LevelFuel, Priority, StateCondition, StateOrder, WorkOrderRequest, WorkOrderResponse } from 'src/app/core/models/work-order';
import { AuthService } from 'src/app/core/services/auth.service';

type Tab = 'nueva' | 'lista' | 'buscar';
type SearchType = 'number' | 'plate' | 'client' | 'state';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.component.html',
  styleUrl: './work-order.component.scss',
})
export class WorkOrderComponent implements OnInit {

  // ── Tabs ──────────────────────────────────────────────────────────────────
  activeTab: Tab = 'nueva';

  // ── Form fields ───────────────────────────────────────────────────────────
  clientname = '';
  clientidentification = '';
  clientphone = '';
  vehicleplate = '';
  vehiclebrand = '';
  vehiclemodel = '';
  vehicleyear: number | null = null;
  vehiclecolor = '';
  failuresreported = '';
  dateestimateddelivery = '';
  accessoriesobservations = '';

  levelfuel: LevelFuel | null = null;
  statescratches: StateCondition = 'SIN_NOVEDAD';
  statedents: StateCondition = 'SIN_NOVEDAD';
  priority: Priority = 'NORMAL';

  // ── Validation ────────────────────────────────────────────────────────────
  dateError = '';
  todayStr = '';
  clientNotFound = false;
  vehicleNotFound = false;

  // ── State ─────────────────────────────────────────────────────────────────
  isLoading = false;
  orders: WorkOrderResponse[] = [];
  searchResults: WorkOrderResponse[] = [];
  searchType: SearchType = 'number';
  searchValue = '';
  searchPerformed = false;

  // ── Confirmation modal ────────────────────────────────────────────────────
  showConfirmation = false;
  confirmedOrder: WorkOrderResponse | null = null;

  // ── Detail modal ──────────────────────────────────────────────────────────
  showDetail = false;
  detailOrder: WorkOrderResponse | null = null;

  // ── Enum options ──────────────────────────────────────────────────────────
  readonly fuelLevels: { value: LevelFuel; label: string }[] = [
    { value: 'VACIO',         label: 'Vacío' },
    { value: 'UN_CUARTO',    label: '¼' },
    { value: 'MITAD',        label: '½' },
    { value: 'TRES_CUARTOS', label: '¾' },
    { value: 'LLENO',        label: 'Lleno' },
  ];

  readonly conditions: { value: StateCondition; label: string }[] = [
    { value: 'SIN_NOVEDAD', label: 'Sin novedad' },
    { value: 'LEVE',        label: 'Leve' },
    { value: 'MODERADO',    label: 'Moderado' },
    { value: 'SEVERO',      label: 'Severo' },
  ];

  readonly priorities: { value: Priority; label: string }[] = [
    { value: 'BAJA',    label: 'Baja' },
    { value: 'NORMAL',  label: 'Normal' },
    { value: 'ALTA',    label: 'Alta' },
    { value: 'URGENTE', label: 'Urgente' },
  ];

  readonly stateOrders: { value: StateOrder; label: string }[] = [
    { value: 'RECIBIDO',       label: 'Recibido' },
    { value: 'EN_DIAGNOSTICO', label: 'En diagnóstico' },
    { value: 'EN_REPARACION',  label: 'En reparación' },
    { value: 'LISTO',          label: 'Listo' },
    { value: 'ENTREGADO',      label: 'Entregado' },
    { value: 'CANCELADO',      label: 'Cancelado' },
  ];

  readonly stateLabels: Record<StateOrder, string> = {
    RECIBIDO:       'Recibido',
    EN_DIAGNOSTICO: 'En diagnóstico',
    EN_REPARACION:  'En reparación',
    LISTO:          'Listo',
    ENTREGADO:      'Entregado',
    CANCELADO:      'Cancelado',
  };

  readonly conditionLabels: Record<StateCondition, string> = {
    SIN_NOVEDAD: 'Sin novedad',
    LEVE:        'Leve',
    MODERADO:    'Moderado',
    SEVERO:      'Severo',
  };

  constructor(
    private workOrderService: WorkOrderService,
    private toastService: ToastService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.todayStr = today.toISOString().split('T')[0];
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'lista') this.loadOrders();
  }

  // ── Validación de fecha ───────────────────────────────────────────────────
  validateDate(): boolean {
    this.dateError = '';
    if (!this.dateestimateddelivery) return true;

    const selected = new Date(this.dateestimateddelivery + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      this.dateError = 'La fecha de entrega no puede ser en el pasado';
      return false;
    }
    return true;
  }

  // ── Blur: verificar cliente ───────────────────────────────────────────────
  onIdentificationBlur(): void {
    if (!this.clientidentification.trim()) {
      this.clientNotFound = false;
      return;
    }
    this.workOrderService.listByClient(this.clientidentification.trim()).subscribe({
      next: (orders) => {
        if (orders.length > 0) {
          this.clientNotFound = false;
          if (!this.clientname.trim()) this.clientname = orders[0].clientname;
          if (!this.clientphone.trim()) this.clientphone = orders[0].clientphone;
        } else {
          this.clientNotFound = true;
        }
      },
      error: () => { this.clientNotFound = true; }
    });
  }

  // ── Blur: verificar placa ─────────────────────────────────────────────────
  onPlateBlur(): void {
    if (!this.vehicleplate.trim()) {
      this.vehicleNotFound = false;
      return;
    }
    this.workOrderService.listByPlate(this.vehicleplate.trim().toUpperCase()).subscribe({
      next: (orders) => {
        if (orders.length > 0) {
          this.vehicleNotFound = false;
          const last = orders[orders.length - 1];
          if (!this.vehiclebrand.trim()) this.vehiclebrand = last.vehiclebrand;
          if (!this.vehiclemodel.trim()) this.vehiclemodel = last.vehiclemodel;
          if (!this.vehicleyear) this.vehicleyear = last.vehicleyear;
          if (!this.vehiclecolor.trim() && last.vehiclecolor) this.vehiclecolor = last.vehiclecolor;
        } else {
          this.vehicleNotFound = true;
        }
      },
      error: () => { this.vehicleNotFound = true; }
    });
  }

  // ── Create ────────────────────────────────────────────────────────────────
  submitOrder(): void {
    if (!this.validateForm()) return;
    if (!this.validateDate()) return;

    const payload: WorkOrderRequest = {
      clientname:              this.clientname.trim(),
      clientidentification:    this.clientidentification.trim(),
      clientphone:             this.clientphone.trim(),
      vehicleplate:            this.vehicleplate.trim().toUpperCase(),
      vehiclebrand:            this.vehiclebrand.trim(),
      vehiclemodel:            this.vehiclemodel.trim(),
      vehicleyear:             this.vehicleyear!,
      vehiclecolor:            this.vehiclecolor.trim() || undefined,
      failuresreported:        this.failuresreported.trim(),
      dateestimateddelivery:   this.dateestimateddelivery || undefined,
      levelfuel:               this.levelfuel ?? undefined,
      statescratches:          this.statescratches,
      statedents:              this.statedents,
      accessoriesobservations: this.accessoriesobservations.trim() || undefined,
      priority:                this.priority,
      createdBy:               this.authService.getUsername(),
    };

    this.isLoading = true;
    this.workOrderService.create(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.confirmedOrder = res;
        this.showConfirmation = true;
        this.clearForm();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.error?.message || 'Error al crear la orden');
      },
    });
  }

  private validateForm(): boolean {
    if (!this.clientname.trim())           { this.toastService.warning('El nombre del cliente es obligatorio'); return false; }
    if (!this.clientidentification.trim()) { this.toastService.warning('La identificación es obligatoria');     return false; }
    if (!this.clientphone.trim())          { this.toastService.warning('El teléfono es obligatorio');           return false; }
    if (!this.vehicleplate.trim())         { this.toastService.warning('La placa es obligatoria');              return false; }
    if (!this.vehiclebrand.trim())         { this.toastService.warning('La marca es obligatoria');              return false; }
    if (!this.vehiclemodel.trim())         { this.toastService.warning('El modelo es obligatorio');             return false; }
    if (!this.vehicleyear)                 { this.toastService.warning('El año es obligatorio');                return false; }
    if (!this.failuresreported.trim())     { this.toastService.warning('Las fallas reportadas son obligatorias'); return false; }
    return true;
  }

  clearForm(): void {
    this.clientname = '';
    this.clientidentification = '';
    this.clientphone = '';
    this.vehicleplate = '';
    this.vehiclebrand = '';
    this.vehiclemodel = '';
    this.vehicleyear = null;
    this.vehiclecolor = '';
    this.failuresreported = '';
    this.dateestimateddelivery = '';
    this.accessoriesobservations = '';
    this.levelfuel = null;
    this.statescratches = 'SIN_NOVEDAD';
    this.statedents = 'SIN_NOVEDAD';
    this.priority = 'NORMAL';
    this.dateError = '';
    this.clientNotFound = false;
    this.vehicleNotFound = false;
  }

  // ── Confirmation modal ────────────────────────────────────────────────────
  closeConfirmation(): void {
    this.showConfirmation = false;
    this.confirmedOrder = null;
  }

  goToList(): void {
    this.closeConfirmation();
    this.setTab('lista');
  }

  // ── Detail modal ──────────────────────────────────────────────────────────
  openDetail(order: WorkOrderResponse): void {
    this.detailOrder = order;
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.detailOrder = null;
  }

  // ── List ──────────────────────────────────────────────────────────────────
  loadOrders(): void {
    this.isLoading = true;
    this.workOrderService.list().subscribe({
      next: (res) => { this.isLoading = false; this.orders = res; },
      error: (err) => { this.isLoading = false; this.toastService.error(err.error?.message || 'Error al cargar órdenes'); },
    });
  }

  // ── Search ────────────────────────────────────────────────────────────────
  onSearchTypeChange(): void {
    this.searchValue = '';
    this.searchResults = [];
    this.searchPerformed = false;
  }

  doSearch(): void {
    if (!this.searchValue.trim()) { this.toastService.warning('Ingresa un valor para buscar'); return; }

    this.isLoading = true;
    this.searchResults = [];
    this.searchPerformed = false;

    if (this.searchType === 'number') {
      this.workOrderService.getByNumber(this.searchValue.trim()).subscribe({
        next: (res) => { this.isLoading = false; this.searchResults = [res]; this.searchPerformed = true; },
        error: () => { this.isLoading = false; this.searchPerformed = true; this.toastService.error('No se encontró la orden'); },
      });
    } else if (this.searchType === 'plate') {
      this.workOrderService.listByPlate(this.searchValue.trim().toUpperCase()).subscribe({
        next: (res) => { this.isLoading = false; this.searchResults = res; this.searchPerformed = true; },
        error: () => { this.isLoading = false; this.searchPerformed = true; this.toastService.error('No se encontraron órdenes'); },
      });
    } else if (this.searchType === 'state') {
      this.workOrderService.listByState(this.searchValue.trim() as StateOrder).subscribe({
        next: (res) => { this.isLoading = false; this.searchResults = res; this.searchPerformed = true; },
        error: () => { this.isLoading = false; this.searchPerformed = true; this.toastService.error('No se encontraron órdenes'); },
      });
    } else {
      this.workOrderService.listByClient(this.searchValue.trim()).subscribe({
        next: (res) => { this.isLoading = false; this.searchResults = res; this.searchPerformed = true; },
        error: () => { this.isLoading = false; this.searchPerformed = true; this.toastService.error('No se encontraron órdenes'); },
      });
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  stateBadgeClass(state: StateOrder): string {
    const map: Record<StateOrder, string> = {
      RECIBIDO:       'badge-recibido',
      EN_DIAGNOSTICO: 'badge-diagnostico',
      EN_REPARACION:  'badge-reparacion',
      LISTO:          'badge-listo',
      ENTREGADO:      'badge-entregado',
      CANCELADO:      'badge-cancelado',
    };
    return map[state] ?? '';
  }

  priorityBadgeClass(priority: Priority): string {
    const map: Record<Priority, string> = {
      BAJA:    'badge-listo',
      NORMAL:  'badge-recibido',
      ALTA:    'badge-reparacion',
      URGENTE: 'badge-cancelado',
    };
    return map[priority] ?? '';
  }

  fuelIndex(level: LevelFuel | undefined): number {
    if (!level) return 0;
    return this.fuelLevels.findIndex(f => f.value === level) + 1;
  }
}