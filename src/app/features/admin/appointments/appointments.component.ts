import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService, Appointment } from '../service/appointment.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

type TabType = 'agenda' | 'reminders';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {

  activeTab: TabType = 'agenda';

  // ── Rol ───────────────────────────────────────────────────────────────────
  isMecanico = false;

  // ── Agenda ────────────────────────────────────────────────────────────────
  agendaForm!: FormGroup;
  agendaType: 'daily' | 'weekly' = 'daily';
  appointments: Appointment[] = [];
  loadingAgenda = false;
  agendaSearched = false;

  // ── Filtro por estado ─────────────────────────────────────────────────────
  filtroEstado = '';

  // ── Reminders (solo mecánico) ──────────────────────────────────────────────
  reminderForm!: FormGroup;
  sendingReminder = false;

  constructor(
    private fb:         FormBuilder,
    private aptService: AppointmentService,
    private toast:      ToastService,
    private auth:       AuthService
  ) {}

  ngOnInit(): void {
    this.isMecanico = this.auth.getRolId() === 2;
    this.buildForms();
  }

  private buildForms(): void {
    this.agendaForm = this.fb.group({
      date:  ['', Validators.required],
      start: [''],
      end:   [''],
    });

    this.reminderForm = this.fb.group({
      appointmentId: [null, [Validators.required, Validators.min(1)]],
      canal:         ['EMAIL', Validators.required],
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ── Agenda ────────────────────────────────────────────────────────────────
  searchAgenda(): void {
    this.agendaForm.markAllAsTouched();
    this.loadingAgenda  = true;
    this.agendaSearched = false;
    this.filtroEstado   = ''; // resetea filtro al consultar

    const { date, start, end } = this.agendaForm.value;
    const obs$ = this.agendaType === 'daily'
      ? this.aptService.daily(date)
      : this.aptService.weekly(start, end);

    obs$.subscribe({
      next: (list) => {
        this.appointments   = list ?? [];
        this.loadingAgenda  = false;
        this.agendaSearched = true;
      },
      error: () => {
        this.loadingAgenda  = false;
        this.agendaSearched = true;
        this.toast.error('Error al cargar la agenda');
      }
    });
  }

  // Devuelve las citas filtradas por estado
  get appointmentsFiltradas(): Appointment[] {
    if (!this.filtroEstado) return this.appointments;
    return this.appointments.filter(a => a.status === this.filtroEstado);
  }

  // ── Reminders ─────────────────────────────────────────────────────────────
  submitReminder(): void {
    this.reminderForm.markAllAsTouched();
    if (this.reminderForm.invalid) return;
    this.sendingReminder = true;
    this.aptService.sendReminder(this.reminderForm.value).subscribe({
      next: () => {
        this.toast.success('Recordatorio enviado correctamente');
        this.sendingReminder = false;
        this.reminderForm.reset({ canal: 'EMAIL' });
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al enviar el recordatorio');
        this.sendingReminder = false;
      }
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      Scheduled: 'Programada', Reprogrammed: 'Reprogramada',
      Cancelled: 'Cancelada',  Completed: 'Completada'
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
}