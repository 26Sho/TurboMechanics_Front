import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService, UserProfileResponse } from 'src/app/core/services/user-profile.service';
import { ClienteVehicleService } from 'src/app/core/services/cliente-vehicle.service';
import { VehiculoClienteResponse } from 'src/app/core/models/vehiculo-cliente';

@Component({
  standalone: false,
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

  profile: UserProfileResponse | null = null;
  loading = true;
  errorMsg = '';

  editMode = false;
  profileForm!: FormGroup;
  savingProfile = false;
  profileSuccess = '';
  profileError = '';

  showPasswordSection = false;
  passwordForm!: FormGroup;
  savingPassword = false;
  passwordSuccess = '';
  passwordError = '';
  showCurrentPassword = false;
  showNewPassword = false;

  vehiculos: VehiculoClienteResponse[] = [];
  loadingVehiculos = false;
  esCliente = false;
  vistaVehiculos: 'lista' | 'carta' = 'lista';

  rolLabel: Record<number, string> = { 1: 'Cliente', 2: 'Mecánico', 3: 'Administrador' };

  constructor(
    private profileService: UserProfileService,
    private vehicleService: ClienteVehicleService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadProfile();
  }

  private buildForms(): void {
    this.profileForm = this.fb.group({
      username:       ['', [Validators.required, Validators.minLength(3)]],
      identification: ['', [Validators.required]],
      phone:          ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
      email:          ['', [Validators.required, Validators.email]]
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
        this.esCliente = data.rolId === 1;
        if (this.esCliente) this.loadVehiculos();
      },
      error: () => { this.errorMsg = 'No se pudo cargar el perfil.'; this.loading = false; }
    });
  }

  loadVehiculos(): void {
    this.loadingVehiculos = true;
    this.vehicleService.list().subscribe({
      next: (data) => { this.vehiculos = data; this.loadingVehiculos = false; },
      error: () => { this.loadingVehiculos = false; }
    });
  }

  goToMisVehiculos(): void { this.router.navigate(['/mis-vehiculos']); }

  enableEdit(): void {
    if (!this.profile) return;
    this.profileForm.patchValue({
      username: this.profile.username, identification: this.profile.identification,
      phone: this.profile.phone, email: this.profile.email
    });
    this.profileError = ''; this.profileSuccess = ''; this.editMode = true;
  }

  cancelEdit(): void { this.editMode = false; this.profileError = ''; this.profileSuccess = ''; }

  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile = true; this.profileError = ''; this.profileSuccess = '';
    this.profileService.updateMyProfile(this.profileForm.value).subscribe({
      next: (updated) => {
        this.profile = updated; this.editMode = false; this.savingProfile = false;
        this.profileSuccess = 'Perfil actualizado correctamente.';
        setTimeout(() => (this.profileSuccess = ''), 3000);
      },
      error: (err) => { this.savingProfile = false; this.profileError = err?.error?.message || 'Error al actualizar el perfil.'; }
    });
  }

  savePassword(): void {
    this.passwordError = ''; this.passwordSuccess = '';
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) { this.passwordError = 'Las contraseñas nuevas no coinciden.'; return; }
    this.savingPassword = true;
    this.profileService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.savingPassword = false; this.passwordSuccess = 'Contraseña cambiada correctamente.';
        this.passwordForm.reset(); this.showPasswordSection = false;
        setTimeout(() => (this.passwordSuccess = ''), 3000);
      },
      error: (err) => { this.savingPassword = false; this.passwordError = err?.error?.message || 'Error al cambiar la contraseña.'; }
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
}