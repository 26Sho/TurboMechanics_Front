import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { RepairsComponent } from './repairs/repairs.component';

const routes: Routes = [

  {
    path: '',

    component: LayoutComponent,

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        component: DashboardComponent
      },

      {
        path: 'orders',
        component: OrdersComponent
      },

      {
        path: 'vehicles',
        component: VehiclesComponent
      },

      {
        path: 'repairs',
        component: RepairsComponent
      }

    ]
  }

];

@NgModule({

  imports: [
    RouterModule.forChild(routes)
  ],

  exports: [
    RouterModule
  ]

})
export class MechanicRoutingModule {}