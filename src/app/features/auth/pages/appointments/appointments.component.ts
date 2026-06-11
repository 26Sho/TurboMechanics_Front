import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService, Appointment, AvailabilityResponse } from '../../../admin/service/appointment.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ClienteVehicleService } from 'src/app/core/services/cliente-vehicle.service';
import { VehiculoClienteResponse } from 'src/app/core/models/vehiculo-cliente';

type TabType = 'register' | 'manage' | 'availability';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {

  activeTab: TabType = 'register';

  // Fecha mínima — desde mañana, o desde mañana si ya pasaron las 5pm
  today = (() => {
    const d = new Date();
    if (d.getHours() >= 17) d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  // ── Vehiculos del cliente ─────────────────────────────────────────────────
  misVehiculos: VehiculoClienteResponse[] = [];
  loadingVehiculos = false;

  // ── Register ──────────────────────────────────────────────────────────────
  registerForm!: FormGroup;
  saving = false;

  // ── Manage ────────────────────────────────────────────────────────────────
  manageForm!: FormGroup;
  manageAppointments: Appointment[] = [];
  loadingManage  = false;
  manageSearched = false;

  showRescheduleModal = false;
  showCancelModal     = false;
  selectedAppointment: Appointment | null = null;
  rescheduleForm!: FormGroup;
  cancelForm!:     FormGroup;
  rescheduling = false;
  cancelling   = false;

  // ── Availability ──────────────────────────────────────────────────────────
  availabilityForm!:   FormGroup;
  availability:        AvailabilityResponse | null = null;
  loadingAvailability  = false;
  availabilitySearched = false;

  constructor(
    private fb:             FormBuilder,
    private aptService:     AppointmentService,
    private toast:          ToastService,
    private auth:           AuthService,
    private vehicleService: ClienteVehicleService
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.cargarVehiculos();
  }

  private buildForms(): void {
    this.registerForm = this.fb.group({
      identification: [null, [Validators.required, Validators.min(1)]],
      plate:          ['',   Validators.required],
      date:           ['',   Validators.required],
      time:           ['',   Validators.required],
      reason:         [''],
      createdBy:      [this.auth.getUsername(), Validators.required],
    });

    this.manageForm = this.fb.group({
      identification: [null, [Validators.required, Validators.min(1)]],
    });

    this.rescheduleForm = this.fb.group({
      newDate: ['', Validators.required],
      newTime: ['', Validators.required],
    });

    this.cancelForm = this.fb.group({
      reason: ['', Validators.required],
    });

    this.availabilityForm = this.fb.group({
      date: ['', Validators.required],
    });
  }

  // ── Cargar vehiculos del cliente ───────────────────────────────────────────
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

  // ── Register ──────────────────────────────────────────────────────────────
  submitRegister(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;
    this.saving = true;
    this.aptService.create(this.registerForm.value).subscribe({
      next: () => {
        this.toast.success('Cita registrada correctamente');
        this.saving = false;
        this.registerForm.reset({ createdBy: this.auth.getUsername() });
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al registrar la cita');
        this.saving = false;
      }
    });
  }

  // ── Manage ────────────────────────────────────────────────────────────────
  searchManage(): void {
    this.manageForm.markAllAsTouched();
    if (this.manageForm.invalid) return;
    this.loadingManage  = true;
    this.manageSearched = false;
    const { identification } = this.manageForm.value;
    this.aptService.byCustomer(identification).subscribe({
      next: (list) => {
        this.manageAppointments = list ?? [];
        this.loadingManage      = false;
        this.manageSearched     = true;
      },
      error: () => {
        this.loadingManage  = false;
        this.manageSearched = true;
        this.toast.error('Error al cargar las citas');
      }
    });
  }

  openReschedule(apt: Appointment): void {
    this.selectedAppointment = apt;
    this.rescheduleForm.reset();
    this.showRescheduleModal = true;
  }

  closeReschedule(): void { this.showRescheduleModal = false; this.selectedAppointment = null; }

  submitReschedule(): void {
    this.rescheduleForm.markAllAsTouched();
    if (this.rescheduleForm.invalid || !this.selectedAppointment) return;
    this.rescheduling = true;
    this.aptService.reschedule(this.selectedAppointment.id, this.rescheduleForm.value).subscribe({
      next: (updated) => {
        const idx = this.manageAppointments.findIndex(a => a.id === updated.id);
        if (idx !== -1) this.manageAppointments[idx] = updated;
        this.toast.success('Cita reprogramada correctamente');
        this.rescheduling = false;
        this.closeReschedule();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al reprogramar');
        this.rescheduling = false;
      }
    });
  }

  openCancel(apt: Appointment): void {
    this.selectedAppointment = apt;
    this.cancelForm.reset();
    this.showCancelModal = true;
  }

  closeCancel(): void { this.showCancelModal = false; this.selectedAppointment = null; }

  submitCancel(): void {
    this.cancelForm.markAllAsTouched();
    if (this.cancelForm.invalid || !this.selectedAppointment) return;
    this.cancelling = true;
    const { reason } = this.cancelForm.value;
    this.aptService.cancel(this.selectedAppointment.id, reason).subscribe({
      next: (updated) => {
        const idx = this.manageAppointments.findIndex(a => a.id === updated.id);
        if (idx !== -1) this.manageAppointments[idx] = updated;
        this.toast.success('Cita cancelada correctamente');
        this.cancelling = false;
        this.closeCancel();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al cancelar');
        this.cancelling = false;
      }
    });
  }

  // ── Availability ──────────────────────────────────────────────────────────
  searchAvailability(): void {
    this.availabilityForm.markAllAsTouched();
    if (this.availabilityForm.invalid) return;
    this.loadingAvailability  = true;
    this.availabilitySearched = false;
    this.aptService.availability(this.availabilityForm.value.date).subscribe({
      next: (data) => {
        this.availability         = data;
        this.loadingAvailability  = false;
        this.availabilitySearched = true;
      },
      error: () => {
        this.loadingAvailability  = false;
        this.availabilitySearched = true;
        this.toast.error('Error al consultar disponibilidad');
      }
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      Scheduled: 'Programada', Reprogrammed: 'Reprogramada',
      Cancelled: 'Cancelada', Completed: 'Completada'
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Scheduled: 'badge--scheduled', Reprogrammed: 'badge--reprogrammed',
      Cancelled: 'badge--cancelled', Completed: 'badge--completed'
    };
    return map[status] ?? '';
  }

  canManage(apt: Appointment): boolean {
    return apt.status === 'Scheduled' || apt.status === 'Reprogrammed';
  }
}