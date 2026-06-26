import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from 'src/app/shared/services/toast.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { environment } from '../../../../environments/environment';
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

  private catalogoUrl   = `${environment.apiUrl}/admin/catalogo`;
  private inventarioUrl = `${environment.apiUrl}/admin/inventario`;

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
    const token = sessionStorage.getItem('token');
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
          next: (data) => { this.servicios = data; this.cargando = false; },
          error: () => { this.toast.error('Error al cargar servicios.'); this.cargando = false; }
        });
        break;
      case 'masUsados':
        this.http.get<PopularSparePartsResponseDTO[]>(
          `${this.inventarioUrl}/reportes/mas-usados`, this.getHeaders()
        ).subscribe({
          next: (data) => { this.repuestosMasUsados = data; this.cargando = false; },
          error: () => { this.toast.error('Error al cargar reporte.'); this.cargando = false; }
        });
        break;
      case 'stockCritico':
        this.http.get<CriticalStockResponseDTO[]>(
          `${this.inventarioUrl}/reportes/stock-critico`, this.getHeaders()
        ).subscribe({
          next: (data) => { this.stockCritico = data; this.cargando = false; },
          error: () => { this.toast.error('Error al cargar stock crítico.'); this.cargando = false; }
        });
        break;
    }
  }

  // ── Helpers privados PDF ──────────────────────────────────

  private crearPDF(titulo: string): jsPDF {
    const doc = new jsPDF({ orientation: 'landscape' });
    const fecha = new Date().toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    // Encabezado naranja
    doc.setFillColor(244, 93, 1);
    doc.rect(0, 0, 297, 22, 'F');

    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('TurboMechanics — ' + titulo, 14, 14);

    // Fecha
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Generado: ' + fecha, 245, 14);

    // Reset color texto
    doc.setTextColor(30, 30, 30);

    return doc;
  }

  // ── Exportar Servicios PDF ────────────────────────────────

  exportarServiciosPDF(): void {
    if (this.servicios.length === 0) {
      this.toast.warning('No hay servicios para exportar.');
      return;
    }

    const doc = this.crearPDF('Catálogo de Servicios');

    autoTable(doc, {
      startY: 28,
      head: [['#', 'Nombre', 'Descripción', 'Precio', 'Estado']],
      body: this.servicios.map((s, i) => [
        i + 1,
        s.name,
        s.description,
        this.formatPeso(s.price),
        s.active ? 'Activo' : 'Inactivo'
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [30, 30, 30]
      },
      headStyles: {
        fillColor: [20, 20, 20],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        3: { halign: 'right' },
        4: { halign: 'center' }
      }
    });

    doc.save(`Catalogo_Servicios_${this.fechaHoy()}.pdf`);
    this.toast.success('PDF de servicios descargado.');
  }

  // ── Exportar Repuestos más usados PDF ────────────────────

  exportarMasUsadosPDF(): void {
    if (this.repuestosMasUsados.length === 0) {
      this.toast.warning('No hay datos para exportar.');
      return;
    }

    const doc = this.crearPDF('Repuestos Más Utilizados');
    const max = this.getMaxUsados();

    autoTable(doc, {
      startY: 28,
      head: [['#', 'Repuesto', 'Referencia', 'Total Salidas', '% Uso']],
      body: this.repuestosMasUsados.map((r, i) => [
        i + 1,
        r.name,
        r.reference,
        r.totalOutput,
        `${Math.round((r.totalOutput / max) * 100)}%`
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [30, 30, 30]
      },
      headStyles: {
        fillColor: [20, 20, 20],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        3: { halign: 'center' },
        4: { halign: 'center' }
      }
    });

    doc.save(`Repuestos_Mas_Usados_${this.fechaHoy()}.pdf`);
    this.toast.success('PDF de repuestos más usados descargado.');
  }

  // ── Exportar Stock crítico PDF ────────────────────────────

  exportarStockPDF(): void {
    if (this.stockCritico.length === 0) {
      this.toast.warning('No hay stock crítico para exportar.');
      return;
    }

    const doc = this.crearPDF('Stock Crítico / Bajo');

    autoTable(doc, {
      startY: 28,
      head: [['Estado', 'Repuesto', 'Referencia', 'Stock Actual', 'Stock Mínimo', 'Déficit']],
      body: this.stockCritico.map(a => [
        a.status,
        a.name,
        a.reference,
        a.currentStock,
        a.stockMin,
        `-${a.stockMin - a.currentStock} uds`
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [30, 30, 30]
      },
      headStyles: {
        fillColor: [20, 20, 20],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didParseCell: (data: any) => {
        // Colorear celda de estado
        if (data.column.index === 0 && data.section === 'body') {
          const val = String(data.cell.raw);
          if (val === 'AGOTADO') {
            data.cell.styles.textColor = [214, 40, 40];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [255, 140, 0];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Colorear déficit en rojo
        if (data.column.index === 5 && data.section === 'body') {
          data.cell.styles.textColor = [214, 40, 40];
        }
      },
      columnStyles: {
        0: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' }
      }
    });

    doc.save(`Stock_Critico_${this.fechaHoy()}.pdf`);
    this.toast.success('PDF de stock crítico descargado.');
  }

  // ── Exportar Excel (existentes) ───────────────────────────

  exportarStockExcel(): void {
    if (this.stockCritico.length === 0) {
      this.toast.warning('No hay stock crítico para exportar.');
      return;
    }
    
    const token = sessionStorage.getItem('token');
    this.http.get(`${this.inventarioUrl}/reportes/stock-critico/excel`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
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
    if (this.repuestosMasUsados.length === 0) {
      this.toast.warning('No hay datos para exportar.');
      return;
    }

    const token = sessionStorage
    .getItem('token');
    this.http.get(`${this.inventarioUrl}/reportes/mas-usados/excel`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
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

  exportarServiciosExcel(): void {
    if(this.servicios.length === 0) {
      this.toast.warning('No hay servicios para exportar.');
      return;
    }
    const filas = this.servicios.map((s, i) => ({
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

  // ── Helpers ───────────────────────────────────────────────

  private fechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatPeso(v: number): string {
    return `$${v.toLocaleString('es-CO')}`;
  }

  getMaxUsados(): number {
    return Math.max(...this.repuestosMasUsados.map(r => r.totalOutput), 1);
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