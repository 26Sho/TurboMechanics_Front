import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from 'src/app/shared/services/toast.service';
import * as XLSX from 'xlsx';

interface ServiceResponseDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

interface PopularSparePartsResponseDTO {
  spacePartsId: number;
  name: string;
  reference: string;
  totalOutput: number;
}

interface CriticalStockResponseDTO {
  spacePartsId: number;
  name: string;
  reference: string;
  currentStock: number;
  stockMin: number;
  status: string;
}

type TabActivo = 'servicios' | 'masUsados' | 'stockCritico';

@Component({
  selector: 'app-reportes',
  standalone: false,
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  private catalogoUrl   = 'http://localhost:9090/admin/catalogo';
  private inventarioUrl = 'http://localhost:9090/admin/inventario';

  tabActivo: TabActivo = 'servicios';
  cargando = false;

  servicios: ServiceResponseDTO[] = [];
  repuestosMasUsados: PopularSparePartsResponseDTO[] = [];
  stockCritico: CriticalStockResponseDTO[] = [];

  constructor(
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarTab();
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  setTab(tab: TabActivo): void {
    this.tabActivo = tab;
    this.cargarTab();
  }

  cargarTab(): void {
    this.cargando = true;
    switch (this.tabActivo) {
      case 'servicios':
        this.http.get<ServiceResponseDTO[]>(this.catalogoUrl, this.getHeaders()).subscribe({
          next: (data: ServiceResponseDTO[]) => { this.servicios = data; this.cargando = false; },
          error: () => { this.toast.error('Error al cargar servicios.'); this.cargando = false; }
        });
        break;
      case 'masUsados':
        this.http.get<PopularSparePartsResponseDTO[]>(
          `${this.inventarioUrl}/reportes/mas-usados`, this.getHeaders()
        ).subscribe({
          next: (data: PopularSparePartsResponseDTO[]) => { this.repuestosMasUsados = data; this.cargando = false; },
          error: () => { this.toast.error('Error al cargar reporte.'); this.cargando = false; }
        });
        break;
      case 'stockCritico':
        this.http.get<CriticalStockResponseDTO[]>(
          `${this.inventarioUrl}/reportes/stock-critico`, this.getHeaders()
        ).subscribe({
          next: (data: CriticalStockResponseDTO[]) => { this.stockCritico = data; this.cargando = false; },
          error: () => { this.toast.error('Error al cargar stock crítico.'); this.cargando = false; }
        });
        break;
    }
  }

  // ── Exportar Excel backend ────────────────────────────────
  exportarStockExcel(): void {
    const token = localStorage.getItem('token');
    this.http.get(`${this.inventarioUrl}/reportes/stock-critico/excel`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-critico-${this.fechaHoy()}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('Excel descargado correctamente.');
      },
      error: () => this.toast.error('Error al descargar el Excel.')
    });
  }

  exportarMasUsadosExcel(): void {
    const token = localStorage.getItem('token');
    this.http.get(`${this.inventarioUrl}/reportes/mas-usados/excel`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `repuestos-mas-usados-${this.fechaHoy()}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('Excel descargado correctamente.');
      },
      error: () => this.toast.error('Error al descargar el Excel.')
    });
  }

  // ── Exportar servicios frontend xlsx ─────────────────────
  exportarServiciosExcel(): void {
    const filas = this.servicios.map((s: ServiceResponseDTO, i: number) => ({
      '#': i + 1,
      'Nombre': s.name,
      'Descripción': s.description,
      'Precio': `$${s.price.toLocaleString('es-CO')}`,
      'Estado': s.active ? 'Activo' : 'Inactivo'
    }));
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Catálogo Servicios');
    XLSX.writeFile(wb, `Catalogo_Servicios_${this.fechaHoy()}.xlsx`);
    this.toast.success('Excel de servicios descargado.');
  }

  private fechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatPeso(v: number): string { return `$${v.toLocaleString('es-CO')}`; }

  getMaxUsados(): number {
    return Math.max(...this.repuestosMasUsados.map((r: PopularSparePartsResponseDTO) => r.totalOutput), 1);
  }

  getTabLabel(): string {
    const labels: Record<TabActivo, string> = {
      servicios:    'Catálogo de Servicios',
      masUsados:    'Repuestos más utilizados',
      stockCritico: 'Stock bajo / agotado'
    };
    return labels[this.tabActivo];
  }
}
