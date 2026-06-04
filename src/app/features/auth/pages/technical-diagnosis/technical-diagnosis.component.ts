import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkOrderService } from '../../../../core/services/work-order.service';
import { DiagnosisService } from '../../../admin/service/diagnosis.service';
import { WorkOrderResponse } from '../../../../core/models/work-order';
import { DiagnosisRequest, DiagnosisResponse, UrgencyLevel } from '../../../../core/models/diagnosis.model';

type ViewMode = 'form' | 'history';

@Component({
  selector: 'app-technical-diagnosis',
  templateUrl: './technical-diagnosis.component.html',
  styleUrls: ['./technical-diagnosis.component.scss']
})
export class TechnicalDiagnosisComponent implements OnInit {

  viewMode: ViewMode = 'form';

  searchOrderId  = '';
  selectedOrder: WorkOrderResponse | null = null;
  loadingOrder   = false;
  orderError     = '';

  // ── Lista de órdenes ───────────────────────────────────────────────────────
  allOrders:     WorkOrderResponse[] = [];
  loadingOrders  = false;
  showOrdersList = false;

  form: DiagnosisRequest = {
    workOrderId: 0,
    detectedfailures: '',
    mechanicobservations: '',
    urgencylevel: 'MEDIO',
    registeredby: ''
  };

  editingId: number | null = null;
  saving      = false;
  formError   = '';
  formSuccess = '';

  diagnosisList: DiagnosisResponse[] = [];
  loadingList = false;

  urgencyOptions: { value: UrgencyLevel; label: string; cls: string }[] = [
    { value: 'BAJO',    label: 'Bajo',    cls: 'urgency--low'      },
    { value: 'MEDIO',   label: 'Medio',   cls: 'urgency--medium'   },
    { value: 'ALTO',    label: 'Alto',    cls: 'urgency--high'     },
    { value: 'CRITICO', label: 'Crítico', cls: 'urgency--critical' }
  ];

  generatingOrder    = false;
  generatedOrderInfo: { message: string; numberorder: string } | null = null;

  constructor(
    private route: ActivatedRoute,
    private workOrderService: WorkOrderService,
    private diagnosisService: DiagnosisService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.queryParamMap.get('orderId');
    if (idParam) { this.searchOrderId = idParam; this.buscarOrden(); }
    this.form.registeredby = sessionStorage.getItem('username') || '';
  }

  buscarOrden(): void {
    const id = parseInt(this.searchOrderId, 10);

    // Sin ID → mostrar lista de todas las órdenes
    if (!id || id <= 0) {
      this.loadingOrders  = true;
      this.showOrdersList = true;
      this.orderError     = '';
      this.workOrderService.list().subscribe({
        next: (orders) => { this.allOrders = orders; this.loadingOrders = false; },
        error: ()       => { this.loadingOrders = false; }
      });
      return;
    }

    // Con ID → buscar directamente
    this.orderError     = '';
    this.selectedOrder  = null;
    this.diagnosisList  = [];
    this.loadingOrder   = true;
    this.showOrdersList = false;

    this.workOrderService.getById(id).subscribe({
      next: (o) => {
        this.selectedOrder    = o;
        this.form.workOrderId = o.id;
        this.loadingOrder     = false;
        this.cargarHistorial(o.id);
      },
      error: (err) => {
        this.orderError   = err.status === 404 ? 'Orden no encontrada.' : 'Error al buscar la orden.';
        this.loadingOrder = false;
      }
    });
  }

  seleccionarOrden(order: WorkOrderResponse): void {
    this.selectedOrder    = order;
    this.form.workOrderId = order.id;
    this.searchOrderId    = String(order.id);
    this.showOrdersList   = false;
    this.orderError       = '';
    this.cargarHistorial(order.id);
  }

  cargarHistorial(workOrderId: number): void {
    this.loadingList = true;
    this.diagnosisService.listByWorkOrder(workOrderId).subscribe({
      next: (list) => { this.diagnosisList = list; this.loadingList = false; },
      error: ()    => { this.loadingList = false; }
    });
  }

  guardarDiagnostico(): void {
    this.formError   = '';
    this.formSuccess = '';

    if (!this.form.workOrderId)                 { this.formError = 'Selecciona una orden de trabajo primero.'; return; }
    if (!this.form.detectedfailures.trim())     { this.formError = 'Las fallas detectadas son obligatorias.'; return; }
    if (!this.form.mechanicobservations.trim()) { this.formError = 'Las observaciones del mecánico son obligatorias.'; return; }
    if (!this.form.urgencylevel)                { this.formError = 'Selecciona el nivel de urgencia.'; return; }

    this.saving = true;
    const obs$ = this.editingId === null
      ? this.diagnosisService.create(this.form)
      : this.diagnosisService.update(this.editingId, this.form);

    obs$.subscribe({
      next: (res) => {
        this.formSuccess = this.editingId === null
          ? `Diagnóstico registrado correctamente (ID: ${res.id}).`
          : 'Diagnóstico actualizado correctamente.';
        this.saving    = false;
        this.editingId = null;
        this.resetForm();
        this.cargarHistorial(this.form.workOrderId);
      },
      error: (err) => {
        this.formError = err.status === 409
          ? (err.error?.message || 'Ya existe un diagnóstico activo para esta orden.')
          : err.status === 404
            ? (err.error?.message || 'La orden de trabajo no existe.')
            : 'Error al guardar el diagnóstico.';
        this.saving = false;
      }
    });
  }

  editarDiagnostico(d: DiagnosisResponse): void {
    if (d.ordergenerated) return;
    this.editingId = d.id;
    this.form = {
      workOrderId:          d.workOrderId,
      detectedfailures:     d.detectedfailures,
      mechanicobservations: d.mechanicobservations,
      urgencylevel:         d.urgencylevel,
      registeredby:         d.registeredby || ''
    };
    this.viewMode  = 'form';
    this.formError = '';
    this.formSuccess = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.editingId   = null;
    this.resetForm();
    this.formError   = '';
    this.formSuccess = '';
  }

  generarOrden(d: DiagnosisResponse): void {
    if (d.ordergenerated) return;
    this.generatingOrder    = true;
    this.generatedOrderInfo = null;
    this.formError          = '';
    const user = sessionStorage.getItem('username') || undefined;

    this.diagnosisService.generateWorkOrder(d.id, user).subscribe({
      next: (res) => {
        this.generatedOrderInfo = { message: res.message, numberorder: res.order.numberorder };
        this.generatingOrder    = false;
        this.cargarHistorial(this.form.workOrderId);
      },
      error: (err) => {
        this.formError       = err.status === 409
          ? (err.error?.message || 'Ya se generó una orden desde este diagnóstico.')
          : 'Error al generar la orden de trabajo.';
        this.generatingOrder = false;
      }
    });
  }

  resetForm(): void {
    const user = this.form.registeredby;
    this.form = {
      workOrderId:          this.selectedOrder?.id || 0,
      detectedfailures:     '',
      mechanicobservations: '',
      urgencylevel:         'MEDIO',
      registeredby:         user
    };
  }

  urgencyClass(level: UrgencyLevel): string {
    const map: Record<UrgencyLevel, string> = {
      BAJO: 'urgency--low', MEDIO: 'urgency--medium',
      ALTO: 'urgency--high', CRITICO: 'urgency--critical'
    };
    return map[level];
  }

  urgencyLabel(level: UrgencyLevel): string {
    const map: Record<UrgencyLevel, string> = {
      BAJO: 'Bajo', MEDIO: 'Medio', ALTO: 'Alto', CRITICO: 'Crítico'
    };
    return map[level];
  }

  stateLabel(state: string): string {
    const map: Record<string, string> = {
      RECIBIDO: 'Recibido', EN_DIAGNOSTICO: 'En diagnóstico',
      EN_REPARACION: 'En reparación', LISTO: 'Listo',
      ENTREGADO: 'Entregado', CANCELADO: 'Cancelado'
    };
    return map[state] ?? state;
  }

  limpiarOrden(): void {
    this.selectedOrder      = null;
    this.diagnosisList      = [];
    this.orderError         = '';
    this.formError          = '';
    this.formSuccess        = '';
    this.generatedOrderInfo = null;
    this.editingId          = null;
    this.searchOrderId      = '';
    this.form.workOrderId   = 0;
    this.showOrdersList     = false;
    this.allOrders          = [];
  }

  get isEditing(): boolean { return this.editingId !== null; }
}