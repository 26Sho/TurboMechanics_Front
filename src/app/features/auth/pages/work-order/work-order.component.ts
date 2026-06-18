import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/shared/services/toast.service';
import { WorkOrderService } from 'src/app/core/services/work-order.service';
import { LevelFuel, MechanicAvailabilityDTO, Priority, StateCondition, StateOrder, WorkOrderRequest, WorkOrderResponse, WorkOrderUpdateRequest } from 'src/app/core/models/work-order';
import { AuthService } from 'src/app/core/services/auth.service';
import { ReceptionVoucherService } from 'src/app/features/admin/service/reception-voucher.service';

type Tab = 'nueva' | 'lista' | 'buscar';
type SearchType = 'number' | 'plate' | 'client' | 'state';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.scss'],
})
export class WorkOrderComponent implements OnInit {

  activeTab: Tab = 'nueva';

  orderForm!: FormGroup;
  editForm!: FormGroup;
  cancelForm!: FormGroup;

  isLoading       = false;
  todayStr        = '';
  clientNotFound  = false;
  vehicleNotFound = false;

  levelfuel:      LevelFuel | null = null;
  statescratches: StateCondition   = 'SIN_NOVEDAD';
  statedents:     StateCondition   = 'SIN_NOVEDAD';
  priority:       Priority         = 'NORMAL';

  editLevelfuel:      LevelFuel | null = null;
  editStatescratches: StateCondition   = 'SIN_NOVEDAD';
  editStatedents:     StateCondition   = 'SIN_NOVEDAD';
  editPriority:       Priority         = 'NORMAL';

  orders:         WorkOrderResponse[] = [];
  searchResults:  WorkOrderResponse[] = [];
  searchType:     SearchType = 'number';
  searchValue     = '';
  suggestions:       string[]  = [];
  loadingSuggestions = false;
  searchPerformed = false;

  downloadingId: number | null = null;

  // ── Cambiar estado ────────────────────────────────────────────────────────
  showChangeState   = false;
  changeStateOrder: WorkOrderResponse | null = null;
  changingState     = false;
  selectedNewState: StateOrder = 'LISTO';

  // ── Asignar mecánico ──────────────────────────────────────────────────────
  showAsignar                        = false;
  asignarOrder: WorkOrderResponse | null = null;
  asignarLoading                     = false;
  cargandoMecanicos                  = false;
  asignarBusqueda                    = '';
  mecanicosDisponibles: MechanicAvailabilityDTO[]          = [];
  mecanicosDisponiblesFiltrados: MechanicAvailabilityDTO[] = [];
  mecanicosOcupadosFiltrados: MechanicAvailabilityDTO[]    = [];
  mecanicoSeleccionado: MechanicAvailabilityDTO | null     = null;

  showConfirmation = false;
  confirmedOrder:  WorkOrderResponse | null = null;
  showDetail  = false;
  detailOrder: WorkOrderResponse | null = null;
  showEdit    = false;
  editOrder:  WorkOrderResponse | null = null;
  editLoading = false;
  showCancel  = false;
  cancelOrder: WorkOrderResponse | null = null;
  cancelLoading = false;

  readonly fuelLevels: { value: LevelFuel; label: string }[] = [
    { value: 'VACIO',        label: 'Vacío' },
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

  readonly mechanicStateOptions: { value: StateOrder; label: string; icon: string }[] = [
    { value: 'EN_REPARACION',  label: 'En reparación',  icon: '🔧' },
    { value: 'LISTO',          label: 'Listo',          icon: '✅' },
    { value: 'ENTREGADO',      label: 'Entregado',      icon: '🚗' },
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
    private fb: FormBuilder,
    private workOrderService: WorkOrderService,
    private toastService: ToastService,
    private authService: AuthService,
    private voucherService: ReceptionVoucherService,
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.todayStr = today.toISOString().split('T')[0];
    this._buildOrderForm();
    this._buildEditForm();
    this._buildCancelForm();
    if (this.isAdmin()) {
      this.activeTab = 'lista';
      this.loadOrders();
    }
  }

  dropdownPlaceholder(): string {
    if (this.searchType === 'number') return 'Selecciona un N° de orden...';
    if (this.searchType === 'plate')  return 'Selecciona una placa...';
    return 'Selecciona una identificación...';
  }

  _loadDropdownOptions(): void {
    this.suggestions = [];
    this.searchValue = '';
    if (this.searchType === 'state') return;
    this.loadingSuggestions = true;
    this.workOrderService.list().subscribe({
      next: (res) => {
        if (this.searchType === 'number') {
          this.suggestions = [...new Set(res.map(o => o.numberorder))];
        } else if (this.searchType === 'plate') {
          this.suggestions = [...new Set(res.map(o => o.vehicleplate))];
        } else {
          this.suggestions = [...new Set(res.map(o => o.clientidentification))];
        }
        this.loadingSuggestions = false;
      },
      error: () => { this.loadingSuggestions = false; }
    });
  }

  private _buildOrderForm(): void {
    this.orderForm = this.fb.group({
      clientidentification:    ['', Validators.required],
      clientname:              ['', Validators.required],
      clientphone:             ['', Validators.required],
      vehicleplate:            ['', Validators.required],
      vehiclebrand:            ['', Validators.required],
      vehiclemodel:            ['', Validators.required],
      vehicleyear:             [null, [Validators.required, Validators.min(1900), Validators.max(2100)]],
      vehiclecolor:            [''],
      failuresreported:        ['', Validators.required],
      dateestimateddelivery:   [''],
      accessoriesobservations: [''],
    });
  }

  private _buildEditForm(): void {
    this.editForm = this.fb.group({
      clientidentification:    ['', Validators.required],
      clientname:              ['', Validators.required],
      clientphone:             ['', Validators.required],
      vehicleplate:            ['', Validators.required],
      vehiclebrand:            ['', Validators.required],
      vehiclemodel:            ['', Validators.required],
      vehicleyear:             [null, [Validators.required, Validators.min(1900), Validators.max(2100)]],
      vehiclecolor:            [''],
      failuresreported:        ['', Validators.required],
      dateestimateddelivery:   [''],
      accessoriesobservations: [''],
    });
  }

  private _buildCancelForm(): void {
    this.cancelForm = this.fb.group({ cancelReason: ['', Validators.required] });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  isAdmin(): boolean    { return this.authService.getRolId() === 3; }
  isMechanic(): boolean { return this.authService.getRolId() === 2; }

  canEdit(order: WorkOrderResponse): boolean {
    return order.stateorder !== 'CANCELADO' && order.stateorder !== 'ENTREGADO';
  }

  canChangeState(order: WorkOrderResponse): boolean {
    return order.stateorder !== 'CANCELADO' && order.stateorder !== 'ENTREGADO';
  }

  // ya tiene mecánico asignado — bloquea el botón asignar
  yaAsignado(order: WorkOrderResponse): boolean {
    return !!order.assignedMechanicName;
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'lista')  this.loadOrders();
    if (tab === 'buscar') this._loadDropdownOptions();
  }

  onIdentificationBlur(): void {
    const id = this.orderForm.get('clientidentification')?.value?.trim();
    if (!id) { this.clientNotFound = false; return; }
    this.workOrderService.listByClient(id).subscribe({
      next: (orders) => {
        if (orders.length > 0) {
          this.clientNotFound = false;
          if (!this.orderForm.get('clientname')?.value)  this.orderForm.patchValue({ clientname:  orders[0].clientname });
          if (!this.orderForm.get('clientphone')?.value) this.orderForm.patchValue({ clientphone: orders[0].clientphone });
        } else { this.clientNotFound = true; }
      },
      error: () => { this.clientNotFound = true; }
    });
  }

  onPlateBlur(): void {
    const plate = this.orderForm.get('vehicleplate')?.value?.trim().toUpperCase();
    if (!plate) { this.vehicleNotFound = false; return; }
    this.workOrderService.listByPlate(plate).subscribe({
      next: (orders) => {
        if (orders.length > 0) {
          this.vehicleNotFound = false;
          const last = orders[orders.length - 1];
          const patch: any = {};
          if (!this.orderForm.get('vehiclebrand')?.value) patch.vehiclebrand = last.vehiclebrand;
          if (!this.orderForm.get('vehiclemodel')?.value) patch.vehiclemodel = last.vehiclemodel;
          if (!this.orderForm.get('vehicleyear')?.value)  patch.vehicleyear  = last.vehicleyear;
          if (!this.orderForm.get('vehiclecolor')?.value && last.vehiclecolor) patch.vehiclecolor = last.vehiclecolor;
          this.orderForm.patchValue(patch);
        } else { this.vehicleNotFound = true; }
      },
      error: () => { this.vehicleNotFound = true; }
    });
  }

  submitOrder(): void {
    this.orderForm.markAllAsTouched();
    if (this.orderForm.invalid) { this.toastService.warning('Completa todos los campos obligatorios'); return; }
    const v = this.orderForm.value;
    const dateVal = v.dateestimateddelivery;
    if (dateVal) {
      const selected = new Date(dateVal + 'T00:00:00');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (selected < today) { this.toastService.warning('La fecha de entrega no puede ser en el pasado'); return; }
    }
    const payload: WorkOrderRequest = {
      clientname:              v.clientname.trim(),
      clientidentification:    v.clientidentification.trim(),
      clientphone:             v.clientphone.trim(),
      vehicleplate:            v.vehicleplate.trim().toUpperCase(),
      vehiclebrand:            v.vehiclebrand.trim(),
      vehiclemodel:            v.vehiclemodel.trim(),
      vehicleyear:             v.vehicleyear,
      vehiclecolor:            v.vehiclecolor?.trim() || undefined,
      failuresreported:        v.failuresreported.trim(),
      dateestimateddelivery:   v.dateestimateddelivery || undefined,
      levelfuel:               this.levelfuel ?? undefined,
      statescratches:          this.statescratches,
      statedents:              this.statedents,
      accessoriesobservations: v.accessoriesobservations?.trim() || undefined,
      priority:                this.priority,
      createdBy:               this.authService.getUsername(),
    };
    this.isLoading = true;
    this.workOrderService.create(payload).subscribe({
      next: (res) => { this.isLoading = false; this.confirmedOrder = res; this.showConfirmation = true; this.clearForm(); },
      error: (err) => { this.isLoading = false; this.toastService.error(err.error?.message || 'Error al crear la orden'); },
    });
  }

  clearForm(): void {
    this.orderForm.reset();
    this.levelfuel = null; this.statescratches = 'SIN_NOVEDAD';
    this.statedents = 'SIN_NOVEDAD'; this.priority = 'NORMAL';
    this.clientNotFound = false; this.vehicleNotFound = false;
  }

  closeConfirmation(): void { this.showConfirmation = false; this.confirmedOrder = null; }
  goToList(): void { this.closeConfirmation(); this.setTab('lista'); }

  openDetail(order: WorkOrderResponse): void { this.detailOrder = order; this.showDetail = true; }
  closeDetail(): void { this.showDetail = false; this.detailOrder = null; }

  openEdit(order: WorkOrderResponse, event?: Event): void {
    event?.stopPropagation();
    this.editOrder = order;
    this.editForm.patchValue({
      clientidentification:    order.clientidentification,
      clientname:              order.clientname,
      clientphone:             order.clientphone,
      vehicleplate:            order.vehicleplate,
      vehiclebrand:            order.vehiclebrand,
      vehiclemodel:            order.vehiclemodel,
      vehicleyear:             order.vehicleyear,
      vehiclecolor:            order.vehiclecolor || '',
      failuresreported:        order.failuresreported,
      dateestimateddelivery:   order.dateestimateddelivery || '',
      accessoriesobservations: order.accessoriesobservations || '',
    });
    this.editLevelfuel      = order.levelfuel || null;
    this.editStatescratches = order.statescratches || 'SIN_NOVEDAD';
    this.editStatedents     = order.statedents    || 'SIN_NOVEDAD';
    this.editPriority       = order.priority;
    this.editForm.markAsPristine(); this.editForm.markAsUntouched();
    this.showEdit = true; this.showDetail = false;
  }

  closeEdit(): void { this.showEdit = false; this.editOrder = null; }

  submitEdit(): void {
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid || !this.editOrder) { this.toastService.warning('Completa todos los campos obligatorios'); return; }
    const v = this.editForm.value;
    const payload: WorkOrderUpdateRequest = {
      clientname:              v.clientname.trim(),
      clientidentification:    v.clientidentification.trim(),
      clientphone:             v.clientphone.trim(),
      vehicleplate:            v.vehicleplate.trim().toUpperCase(),
      vehiclebrand:            v.vehiclebrand.trim(),
      vehiclemodel:            v.vehiclemodel.trim(),
      vehicleyear:             v.vehicleyear,
      vehiclecolor:            v.vehiclecolor?.trim() || undefined,
      failuresreported:        v.failuresreported.trim(),
      dateestimateddelivery:   v.dateestimateddelivery || undefined,
      levelfuel:               this.editLevelfuel ?? undefined,
      statescratches:          this.editStatescratches,
      statedents:              this.editStatedents,
      accessoriesobservations: v.accessoriesobservations?.trim() || undefined,
      priority:                this.editPriority,
    };
    this.editLoading = true;
    this.workOrderService.update(this.editOrder.id, payload).subscribe({
      next: (res) => {
        this.editLoading = false;
        this.toastService.success('Orden actualizada correctamente');
        this._replaceInList(this.orders, res.order);
        this._replaceInList(this.searchResults, res.order);
        this.closeEdit();
      },
      error: (err) => { this.editLoading = false; this.toastService.error(err.error?.message || 'Error al actualizar la orden'); },
    });
  }

  openCancel(order: WorkOrderResponse, event?: Event): void {
    event?.stopPropagation();
    this.cancelOrder = order; this.cancelForm.reset();
    this.showCancel = true; this.showDetail = false;
  }

  closeCancel(): void { this.showCancel = false; this.cancelOrder = null; }

  submitCancel(): void {
    this.cancelForm.markAllAsTouched();
    if (this.cancelForm.invalid || !this.cancelOrder) { this.toastService.warning('El motivo de cancelación es obligatorio'); return; }
    this.cancelLoading = true;
    this.workOrderService.cancel(this.cancelOrder.id, this.cancelForm.value.cancelReason.trim()).subscribe({
      next: (res) => {
        this.cancelLoading = false;
        this.toastService.success('Orden cancelada correctamente');
        this._replaceInList(this.orders, res.order);
        this._replaceInList(this.searchResults, res.order);
        this.closeCancel();
      },
      error: (err) => { this.cancelLoading = false; this.toastService.error(err.error?.message || 'Error al cancelar la orden'); },
    });
  }

  // ── Cambiar estado ────────────────────────────────────────────────────────
  openChangeState(order: WorkOrderResponse, event?: Event): void {
    event?.stopPropagation();
    this.changeStateOrder = order;
    this.selectedNewState = this._nextState(order.stateorder);
    this.showChangeState  = true;
    this.showDetail       = false;
  }

  closeChangeState(): void { this.showChangeState = false; this.changeStateOrder = null; }

  submitChangeState(): void {
    if (!this.changeStateOrder) return;
    this.changingState = true;
    this.workOrderService.changeState(this.changeStateOrder.id, this.selectedNewState).subscribe({
      next: (res) => {
        this.changingState = false;
        this.toastService.success(`Orden marcada como: ${this.stateLabels[this.selectedNewState]}`);
        this._replaceInList(this.orders, res.order);
        this._replaceInList(this.searchResults, res.order);
        this.closeChangeState();
      },
      error: (err) => {
        this.changingState = false;
        this.toastService.error(err.error?.message || 'Error al cambiar el estado');
      }
    });
  }

  private _nextState(current: StateOrder): StateOrder {
    const flow: StateOrder[] = ['RECIBIDO', 'EN_DIAGNOSTICO', 'EN_REPARACION', 'LISTO', 'ENTREGADO'];
    const idx = flow.indexOf(current);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : 'ENTREGADO';
  }

  // ── List / Search ─────────────────────────────────────────────────────────
  loadOrders(): void {
    this.isLoading = true;
    this.workOrderService.list().subscribe({
      next: (res) => { this.isLoading = false; this.orders = res; },
      error: (err) => { this.isLoading = false; this.toastService.error(err.error?.message || 'Error al cargar órdenes'); },
    });
  }

  onSearchTypeChange(): void {
    this.searchValue = ''; this.searchResults = []; this.searchPerformed = false;
    this.suggestions = []; this.loadingSuggestions = false;
    this._loadDropdownOptions();
  }

  doSearch(): void {
    if (!this.searchValue.trim()) { this.toastService.warning('Ingresa un valor para buscar'); return; }
    this.isLoading = true; this.searchResults = []; this.searchPerformed = false;
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

  descargarComprobante(order: WorkOrderResponse, event: Event): void {
    event.stopPropagation();
    this.downloadingId = order.id;
    this.voucherService.downloadVoucherById(order.id).subscribe({
      next: (blob: Blob) => {
        this.voucherService.saveBlobAsPdf(blob, `comprobante-${order.numberorder}.pdf`);
        this.downloadingId = null;
        this.toastService.success('Comprobante descargado correctamente');
      },
      error: () => { this.downloadingId = null; this.toastService.error('Error al generar el comprobante'); }
    });
  }

  // ── Asignar mecánico ──────────────────────────────────────────────────────
  openAsignar(order: WorkOrderResponse, event?: Event): void {
    event?.stopPropagation();
    this.asignarOrder              = order;
    this.mecanicoSeleccionado      = null;
    this.asignarBusqueda           = '';
    this.mecanicosDisponibles      = [];
    this.mecanicosDisponiblesFiltrados = [];
    this.mecanicosOcupadosFiltrados    = [];
    this.showAsignar = true; this.showDetail = false;
    this._cargarDisponibilidad();
  }

  closeAsignar(): void { this.showAsignar = false; this.asignarOrder = null; }

  private _cargarDisponibilidad(): void {
    this.cargandoMecanicos = true;
    this.workOrderService.getMechanicAvailability().subscribe({
      next: (data: MechanicAvailabilityDTO[]) => {
        this.mecanicosDisponibles = data;
        this.cargandoMecanicos    = false;
        this.filtrarMecanicosDisponibles();
      },
      error: () => { this.toastService.error('Error al cargar la disponibilidad de mecánicos.'); this.cargandoMecanicos = false; }
    });
  }

  filtrarMecanicosDisponibles(): void {
    const q = this.asignarBusqueda.toLowerCase().trim();
    const lista = q
      ? this.mecanicosDisponibles.filter(m => m.name.toLowerCase().includes(q) || m.position.toLowerCase().includes(q))
      : [...this.mecanicosDisponibles];
    this.mecanicosDisponiblesFiltrados = lista.filter(m => m.available);
    this.mecanicosOcupadosFiltrados    = lista.filter(m => !m.available);
  }

  seleccionarMecanico(m: MechanicAvailabilityDTO): void { this.mecanicoSeleccionado = m; }

  confirmarAsignacion(): void {
    if (!this.mecanicoSeleccionado || !this.asignarOrder) return;
    this.asignarLoading = true;
    this.workOrderService.assignMechanic(this.asignarOrder.id, this.mecanicoSeleccionado.document).subscribe({
      next: (updatedOrder: WorkOrderResponse) => {
        this.asignarLoading = false;
        this.toastService.success(`Mecánico ${this.mecanicoSeleccionado!.name} asignado correctamente.`);
        this._replaceInList(this.orders, updatedOrder);
        this._replaceInList(this.searchResults, updatedOrder);
        this.closeAsignar();
      },
      error: (err: any) => { this.asignarLoading = false; this.toastService.error(err.error?.message || 'Error al asignar el mecánico.'); }
    });
  }

  desasignarMecanico(): void {
    if (!this.asignarOrder) return;
    this.asignarLoading = true;
    this.workOrderService.unassignMechanic(this.asignarOrder.id).subscribe({
      next: (updatedOrder: WorkOrderResponse) => {
        this.asignarLoading       = false;
        this.mecanicoSeleccionado = null;
        this.asignarOrder         = updatedOrder;
        this._replaceInList(this.orders, updatedOrder);
        this._replaceInList(this.searchResults, updatedOrder);
        this.toastService.success('Mecánico desasignado correctamente.');
        this._cargarDisponibilidad();
      },
      error: (err: any) => { this.asignarLoading = false; this.toastService.error(err.error?.message || 'Error al desasignar el mecánico.'); }
    });
  }

  private _replaceInList(list: WorkOrderResponse[], updated: WorkOrderResponse): void {
    const idx = list.findIndex(o => o.id === updated.id);
    if (idx !== -1) list[idx] = updated;
  }

  stateBadgeClass(state: StateOrder): string {
    const map: Record<StateOrder, string> = {
      RECIBIDO: 'badge-recibido', EN_DIAGNOSTICO: 'badge-diagnostico',
      EN_REPARACION: 'badge-reparacion', LISTO: 'badge-listo',
      ENTREGADO: 'badge-entregado', CANCELADO: 'badge-cancelado',
    };
    return map[state] ?? '';
  }

  priorityBadgeClass(priority: Priority): string {
    const map: Record<Priority, string> = {
      BAJA: 'badge-listo', NORMAL: 'badge-recibido',
      ALTA: 'badge-reparacion', URGENTE: 'badge-cancelado',
    };
    return map[priority] ?? '';
  }

  fuelIndex(level: LevelFuel | undefined): number {
    if (!level) return 0;
    return this.fuelLevels.findIndex(f => f.value === level) + 1;
  }
}