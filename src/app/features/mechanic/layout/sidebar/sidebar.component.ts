import { Component, inject } from '@angular/core';
import { SidebarService } from '../../service/sidebar.service';

@Component({
  standalone: false,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  sidebarService = inject(SidebarService);
}
