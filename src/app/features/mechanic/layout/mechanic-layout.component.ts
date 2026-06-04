import { Component, inject } from '@angular/core';
import { SidebarService } from '../service/sidebar.service';

@Component({
  selector: 'app-mechanic-layout',
  templateUrl: './mechanic-layout.component.html',
  styleUrls: ['./mechanic-layout.component.scss'],
})
export class MechanicLayoutComponent {
  sidebarService = inject(SidebarService);
}
