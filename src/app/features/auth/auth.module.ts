import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './pages/auth/auth.component';
import { LoginComponent } from './pages/login/login.component';
import { RecoverPasswordComponent } from './pages/recover-password/recover-password.component';
import { RegisterComponent } from './pages/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WorkOrderComponent } from './pages/work-order/work-order.component';
import { VehicleComponent } from './pages/vehicle/vehicle.component';
import { VehicleHistoryComponent } from './pages/vehicle-history/vehicle-history.component';
import { TechnicalDiagnosisComponent } from './pages/technical-diagnosis/technical-diagnosis.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { MaintenanceTrackingComponent } from './pages/maintenance-tracking/maintenance-tracking.component';
import { MechanicMaintenanceComponent } from './pages/mechanic-maintenance/mechanic-maintenance.component';

@NgModule({
  declarations: [AuthComponent, LoginComponent, RecoverPasswordComponent, RegisterComponent, WorkOrderComponent, VehicleComponent, VehicleHistoryComponent, TechnicalDiagnosisComponent, AppointmentsComponent, MaintenanceTrackingComponent, MechanicMaintenanceComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ], exports: [AuthComponent, RecoverPasswordComponent]
})
export class AuthModule { }
