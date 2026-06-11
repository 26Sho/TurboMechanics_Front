import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MechanicLayoutComponent } from './layout/mechanic-layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { RepairsComponent } from './repairs/repairs.component';
import { HistoryComponent } from './history/history.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ClientsComponent } from './clients/clients.component';

// Componentes del proyecto actual que reutiliza el mecánico
import { AppointmentsComponent } from '../admin/appointments/appointments.component';
import { MechanicMaintenanceComponent } from '../auth/pages/mechanic-maintenance/mechanic-maintenance.component';
import { WorkOrderComponent } from '../auth/pages/work-order/work-order.component';
import { VehicleHistoryComponent } from '../auth/pages/vehicle-history/vehicle-history.component';
import { TechnicalDiagnosisComponent } from '../auth/pages/technical-diagnosis/technical-diagnosis.component';
import { MovementsComponent } from '../admin/movements/movements.component';
import { VehicleComponent } from '../auth/pages/vehicle/vehicle.component';
import { WhatsappComponent } from './whatsapp/whatsapp.component';
import { PerfilComponent } from '../shared/perfil/perfil.component';

const routes: Routes = [
  {
    path: '',
    component: MechanicLayoutComponent,
    children: [
      { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    component: DashboardComponent },
      { path: 'orders',       component: OrdersComponent },
      { path: 'repairs',      component: RepairsComponent },
      { path: 'history',      component: HistoryComponent },
      { path: 'inventory',    component: InventoryComponent },
      { path: 'clients',      component: ClientsComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'maintenance',  component: MechanicMaintenanceComponent },
      { path: 'work-order',   component: WorkOrderComponent },
      { path: 'vehicle-history', component: VehicleHistoryComponent },
      { path: 'diagnosis',    component: TechnicalDiagnosisComponent },
      { path: 'movements',    component: MovementsComponent },
      { path: 'vehicles', component: VehicleComponent },
      { path: 'whatsapp', component: WhatsappComponent },
      { path: 'perfil', component: PerfilComponent },
    ]
  }
];

@NgModule({
  declarations: [
    MechanicLayoutComponent,
    SidebarComponent,
    TopbarComponent,
    DashboardComponent,
    OrdersComponent,
    RepairsComponent,
    HistoryComponent,
    InventoryComponent,
    ClientsComponent,
    WhatsappComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class MechanicModule { }