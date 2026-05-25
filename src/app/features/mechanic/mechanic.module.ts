import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MechanicRoutingModule } from './mechanic-routing.module';


import { LayoutComponent } from './layout/layout.component';

import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';


import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { RepairsComponent } from './repairs/repairs.component';

@NgModule({

  declarations: [
    LayoutComponent,
    SidebarComponent,
    TopbarComponent,
    DashboardComponent,
    OrdersComponent,
    VehiclesComponent,
    RepairsComponent
  ],

  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,  
    MechanicRoutingModule
  ]

})
export class MechanicModule {}