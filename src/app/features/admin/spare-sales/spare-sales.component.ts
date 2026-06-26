import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/core/services/auth.service';

import { environment } from '../../../../environments/environment';
export interface SpareSale {
  id: number;
  sparePartName: string;
  sparePartReference: string;
  sparePartCategory: string;
  payerEmail: string;
  price: number;
  externalReference: string;
  preferenceId: string;
  createdAt: string;
  status: string;
}

@Component({
  standalone: false,
  selector: 'app-spare-sales',
  templateUrl: './spare-sales.component.html',
  styleUrls: ['./spare-sales.component.scss']
})
export class SpareSalesComponent implements OnInit {

  sales: SpareSale[]         = [];
  filteredSales: SpareSale[] = [];
  loading                    = false;
  search                     = '';

  private readonly apiUrl = `${environment.apiUrl}/spare-sales`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading = true;
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
    this.http.get<SpareSale[]>(this.apiUrl, { headers }).subscribe({
      next: (data) => {
        this.sales         = data;
        this.filteredSales = data;
        this.loading       = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filter(): void {
    const q = this.search.toLowerCase().trim();
    this.filteredSales = !q
      ? this.sales
      : this.sales.filter(s =>
          s.sparePartName.toLowerCase().includes(q) ||
          s.sparePartReference.toLowerCase().includes(q) ||
          s.sparePartCategory.toLowerCase().includes(q) ||
          s.payerEmail.toLowerCase().includes(q) ||
          s.externalReference.toLowerCase().includes(q)
        );
  }

  statusClass(status: string): string {
    switch (status) {
      case 'APPROVED':  return 'badge--approved';
      case 'REJECTED':  return 'badge--rejected';
      case 'CANCELLED': return 'badge--cancelled';
      default:          return 'badge--pending';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'APPROVED':  return 'Aprobado';
      case 'REJECTED':  return 'Rechazado';
      case 'CANCELLED': return 'Cancelado';
      default:          return 'Pendiente';
    }
  }

  get totalVentas(): number {
    return this.sales.filter(s => s.status === 'APPROVED')
      .reduce((acc, s) => acc + s.price, 0);
  }
}