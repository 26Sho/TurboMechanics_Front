import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TiendaService, Repuesto, PagoResponse } from 'src/app/core/services/tienda.service';

@Component({
  selector: 'app-tienda',
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.scss']
})
export class TiendaComponent implements OnInit {

  repuestos: Repuesto[]          = [];
  repuestosFiltrados: Repuesto[] = [];
  categorias: string[]           = [];
  categoriaActiva                = 'Todos';
  loading                        = true;
  comprando: number | null       = null;

  get isLoggedIn(): boolean { return this.authService.isLoggedIn(); }

  constructor(
    private tiendaService: TiendaService,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.tiendaService.getRepuestos().subscribe({
      next: (data: Repuesto[]) => {
        this.repuestos = data;
        const cats: string[] = [...new Set(
          data.map((r: Repuesto) => r.category).filter((c: string) => !!c)
        )];
        this.categorias = ['Todos', ...cats];
        this.repuestosFiltrados = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.toast.error('No se pudieron cargar los repuestos.');
      }
    });
  }

  filtrar(cat: string): void {
    this.categoriaActiva = cat;
    this.repuestosFiltrados = cat === 'Todos'
      ? this.repuestos
      : this.repuestos.filter((r: Repuesto) => r.category === cat);
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  comprar(repuesto: Repuesto): void {
    this.comprando = repuesto.id;

    this.tiendaService.comprarRepuesto({
      sparePartId: repuesto.id,
      payerEmail:  this.authService.getEmail()
    }).subscribe({
      next: (res: PagoResponse) => {
        this.comprando = null;
        if (res.initPoint) {
          window.open(res.initPoint, '_blank');
        } else {
          this.toast.success('Pago procesado correctamente.');
        }
      },
      error: (err: any) => {
        this.comprando = null;
        this.toast.error(err?.error?.message || 'Error al procesar el pago.');
      }
    });
  }
}