import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MaintenanceTrackingService,
  MaintenanceStatusResponse,
  NotificationConsent,
  NotificationChannel,
  Issue,
  MaintenanceProgress,
  NotificationLog
} from '../../../admin/service/maintenance-tracking.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ClienteVehicleService } from 'src/app/core/services/cliente-vehicle.service';
import { VehiculoClienteResponse } from 'src/app/core/models/vehiculo-cliente';

type TabType = 'status' | 'consent';

@Component({
  standalone: false,
  selector: 'app-maintenance-tracking',
  templateUrl: './maintenance-tracking.component.html',
  styleUrls: ['./maintenance-tracking.component.scss']
})
export class MaintenanceTrackingComponent implements OnInit {

  activeTab: TabType = 'status';

  // ── Estado (HU 9.1, 9.2, 9.3) ────────────────────────────────────────────
  statusForm!: FormGroup;
  status: MaintenanceStatusResponse | null = null;
  loadingStatus = false;
  statusSearched = false;

  // ── Avances e inconvenientes (HU 9.6.7, 9.7.7) ───────────────────────────
  progresses: MaintenanceProgress[] = [];
  issues: Issue[] = [];
  loadingProgress = false;
  loadingIssues = false;

  // ── Historial de notificaciones (ST-9.5.8) ────────────────────────────────
  notifications: NotificationLog[] = [];
  loadingNotifications = false;

  // ── Historial de servicios (ST-9.3.7) ────────────────────────────────────
  history: MaintenanceStatusResponse[] = [];
  loadingHistory = false;

  // ── Consentimiento (HU 9.8, 9.9) ─────────────────────────────────────────
  consentForm!: FormGroup;
  consent: NotificationConsent | null = null;
  loadingConsent = false;
  savingConsent = false;
  consentSearched = false;

  // ── Vehículos del cliente ─────────────────────────────────────────────────
  misVehiculos: VehiculoClienteResponse[] = [];
  loadingVehiculos = false;

  channels: { value: NotificationChannel; label: string }[] = [
    { value: 'Email', label: '📧 Correo electrónico' },
    { value: 'Whatsapp', label: '💬 WhatsApp' },
    { value: 'Both', label: '📧💬 Ambos' },
  ];

  constructor(
    private fb: FormBuilder,
    private service: MaintenanceTrackingService,
    private toast: ToastService,
    private auth: AuthService,
    private vehicleService: ClienteVehicleService
  ) { }

  ngOnInit(): void {
    this.buildForms();
    this.cargarVehiculos();
  }

  private buildForms(): void {
    this.statusForm = this.fb.group({
      plate: ['', Validators.required],
    });

    this.consentForm = this.fb.group({
      identification: [null, [Validators.required, Validators.min(1)]],
      authorized: [true, Validators.required],
      channel: ['Email'],
    });
  }

  // ── Cargar vehículos del cliente ──────────────────────────────────────────
  cargarVehiculos(): void {
    this.loadingVehiculos = true;
    this.vehicleService.list().subscribe({
      next: (data) => { this.misVehiculos = data; this.loadingVehiculos = false; },
      error: () => { this.loadingVehiculos = false; }
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  searchStatus(): void {
    this.statusForm.markAllAsTouched();
    if (this.statusForm.invalid) return;
    this.loadingStatus = true;
    this.statusSearched = false;
    this.progresses = [];
    this.issues = [];
    this.history = [];
    this.notifications = [];
    const plate = this.statusForm.value.plate;
    this.service.getStatusByPlate(plate).subscribe({
      next: (data) => {
        this.status = data;
        this.loadingStatus = false;
        this.statusSearched = true;
        this.loadProgress(data.workOrderId);
        this.loadIssues(data.workOrderId);
        this.loadHistory(plate);
        this.loadNotifications(data.workOrderId);
      },
      error: () => {
        this.loadingStatus = false;
        this.statusSearched = true;
        this.toast.error('No se encontró mantenimiento activo para esa placa');
      }
    });
  }

  loadProgress(workOrderId: number): void {
    this.loadingProgress = true;
    this.service.getProgress(workOrderId).subscribe({
      next: (list) => { this.progresses = list ?? []; this.loadingProgress = false; },
      error: () => { this.loadingProgress = false; }
    });
  }

  loadIssues(workOrderId: number): void {
    this.loadingIssues = true;
    this.service.getIssues(workOrderId).subscribe({
      next: (list) => { this.issues = list ?? []; this.loadingIssues = false; },
      error: () => { this.loadingIssues = false; }
    });
  }

  loadNotifications(workOrderId: number): void {
    this.loadingNotifications = true;
    this.service.getNotifications(workOrderId).subscribe({
      next: (list) => { this.notifications = list ?? []; this.loadingNotifications = false; },
      error: () => { this.loadingNotifications = false; }
    });
  }

  loadHistory(plate: string): void {
    this.loadingHistory = true;
    this.service.getHistoryByPlate(plate).subscribe({
      next: (list) => {
        this.history = (list ?? []).filter(o => o.workOrderId !== this.status?.workOrderId);
        this.loadingHistory = false;
      },
      error: () => { this.loadingHistory = false; }
    });
  }

  issueClass(status: string): string {
    return status === 'Open' ? 'badge--reprogrammed' : 'badge--completed';
  }

  stateLabel(state: string): string {
    const map: Record<string, string> = {
      RECIBIDO: 'Recibido', EN_DIAGNOSTICO: 'En diagnóstico',
      EN_REPARACION: 'En reparación', LISTO: 'Listo para entrega',
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

  loadConsent(): void {
    this.consentForm.get('identification')!.markAsTouched();
    const id = this.consentForm.value.identification;
    if (!id) return;
    this.loadingConsent = true;
    this.consentSearched = false;
    this.service.getConsent(id).subscribe({
      next: (data) => {
        this.consent = data;
        this.consentForm.patchValue({ authorized: data.authorized, channel: data.channel ?? 'Email' });
        this.loadingConsent = false;
        this.consentSearched = true;
      },
      error: () => {
        this.consent = null;
        this.loadingConsent = false;
        this.consentSearched = true;
      }
    });
  }

  saveConsent(): void {
    this.consentForm.markAllAsTouched();
    if (this.consentForm.invalid) return;
    this.savingConsent = true;
    const { identification, authorized, channel } = this.consentForm.value;
    this.service.saveConsent({ identification, authorized, channel: authorized ? channel : null }).subscribe({
      next: (data) => {
        this.consent = data;
        this.savingConsent = false;
        this.toast.success('Consentimiento guardado correctamente');
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al guardar el consentimiento');
        this.savingConsent = false;
      }
    });
  }

  get showChannel(): boolean {
    return this.consentForm.get('authorized')!.value === true;
  }
}