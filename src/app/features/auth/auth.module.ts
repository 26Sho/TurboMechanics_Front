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
import { EstimateApproveComponent } from './pages/estimate-approve/estimate-approve.component';
import { EstimateRejectComponent } from './pages/estimate-reject/estimate-reject.component';
import { ClientBillsComponent } from './pages/client-bills/client-bills.component';
import { MisVehiculosComponent } from './pages/mis-vehiculos/mis-vehiculos.component';

@NgModule({
  declarations: [AuthComponent, LoginComponent, RecoverPasswordComponent, RegisterComponent, WorkOrderComponent, VehicleComponent, VehicleHistoryComponent, TechnicalDiagnosisComponent, AppointmentsComponent, MaintenanceTrackingComponent, MechanicMaintenanceComponent, EstimateApproveComponent, EstimateRejectComponent, ClientBillsComponent, MisVehiculosComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ], exports: [AuthComponent, RecoverPasswordComponent]
})
export class AuthModule { }
