import { NgModule } from '@angular/core';

import { DashboardComponent } from './dashboard/dashboard.component';
import { HistoryComponent } from './history/history.component';
import { InventoryComponent } from './inventory/inventory.component';
import { LayoutComponent } from '../admin/layout/layout.component';
import { OrdersComponent } from './orders/orders.component';
import { RepairsComponent } from './repairs/repairs.component';
import { ReportsComponent } from './reports/reports.component';
import { MechanicLayoutComponent } from './layout/mechanic-layout.component';
import { SettingsComponent } from './settings/settings.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    DashboardComponent,
    HistoryComponent,
    InventoryComponent,
    MechanicLayoutComponent,
    OrdersComponent,
    RepairsComponent,
    ReportsComponent,
    SettingsComponent,
    VehiclesComponent

  ],
  imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      RouterModule
    ]
    })
export class MechanicModule { }