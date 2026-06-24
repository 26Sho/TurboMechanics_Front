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

  // Imágenes por defecto según categoría
  private readonly imagenesCategoria: Record<string, string> = {
    'Filtros':     'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400&q=80',
    'Bujias':      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    'Frenos':      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80',
    'Aceites':     'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
    'Suspension':  'https://images.unsplash.com/photo-1568844293986-ca047aa49f9b?w=400&q=80',
    'Electrico':   'https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?w=400&q=80',
    'Motor':       'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80',
    'Transmision': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80',
  };

  private readonly iconosCategoria: Record<string, string> = {
    'Filtros':     'fas fa-filter',
    'Bujias':      'fas fa-bolt',
    'Frenos':      'fas fa-circle',
    'Aceites':     'fas fa-oil-can',
    'Suspension':  'fas fa-car-crash',
    'Electrico':   'fas fa-plug',
    'Motor':       'fas fa-cogs',
    'Transmision': 'fas fa-cog',
  };

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
      error: () => {
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

  getImagenCategoria(categoria: string): string {
    const key = Object.keys(this.imagenesCategoria).find(k =>
      categoria?.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(categoria?.toLowerCase())
    );
    return key
      ? this.imagenesCategoria[key]
      : 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80';
  }

  getIconoCategoria(categoria: string): string {
    const key = Object.keys(this.iconosCategoria).find(k =>
      categoria?.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(categoria?.toLowerCase())
    );
    return key ? this.iconosCategoria[key] : 'fas fa-cog';
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
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