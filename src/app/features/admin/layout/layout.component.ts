import { Component, inject } from '@angular/core';
import { SidebarService } from '../service/sidebar.service';

@Component({
  standalone: false,
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  sidebarService = inject(SidebarService);
}