import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ReviewService, ReviewRequestDTO, ReviewResponseDTO } from '../../core/services/review.service';
import { ToastService } from '../../shared/services/toast.service';
import { WorkOrderService } from '../../core/services/work-order.service';
import { WorkOrderResponse } from '../../core/models/work-order';

@Component({
  standalone: false,
  selector: 'app-satisfaction-survey',
  templateUrl: './satisfaction-survey.component.html',
  styleUrls: ['./satisfaction-survey.component.scss']
})
export class SatisfactionSurveyComponent implements OnInit {

  // ── Formulario ─────────────────────────────────────────────────────────────
  rating: number = 0;
  hoverRating: number = 0;
  comment: string = '';
  selectedWorkOrderId: number | null = null;
  clientIdentification: string = '';  // cédula del cliente para buscar sus órdenes

  // ── Estado UI ──────────────────────────────────────────────────────────────
  submitted: boolean = false;
  loading: boolean = false;
  loadingOrders: boolean = false;
  errorMsg: string = '';

  // ── Datos ──────────────────────────────────────────────────────────────────
  deliveredOrders: { id: number; numberorder: string }[] = [];
  publicReviews: ReviewResponseDTO[] = [];
  myReviews: ReviewResponseDTO[] = [];

  // ── Panel de reseñas ───────────────────────────────────────────────────────
  panelOpen: boolean = false;
  activeTab: 'all' | 'mine' = 'all';
  sortBy: string = 'fecha';

  // ── Roles ──────────────────────────────────────────────────────────────────
  isLoggedIn: boolean = false;
  isCliente: boolean = false;
  isAdmin: boolean = false;

  // ── Confirmación eliminar ──────────────────────────────────────────────────
  confirmDeleteId: number | null = null;

  readonly ratingLabels = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

  constructor(
    private authService: AuthService,
    private reviewService: ReviewService,
    private workOrderService: WorkOrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const rolId = this.authService.getRolId();
    this.isCliente = rolId === 1;
    this.isAdmin   = rolId === 3;

    // Cargar reseñas siempre, con o sin sesión activa
    this.loadPublicReviews();

    if (this.isCliente) {
      this.loadDeliveredOrders();
      this.loadMyReviews();
    }
  }

  // ── Carga de datos ─────────────────────────────────────────────────────────

  loadPublicReviews(): void {
    const request$ = this.isLoggedIn
      ? this.reviewService.listAll(this.sortBy)
      : this.reviewService.listAllPublic(this.sortBy);
    request$.subscribe({
      next: (data) => (this.publicReviews = data),
      error: () => {}
    });
  }

  loadMyReviews(): void {
    this.reviewService.listMine().subscribe({
      next: (data) => (this.myReviews = data),
      error: () => {}
    });
  }

  /** Busca las órdenes ENTREGADAS del cliente usando su número de cédula. */
  loadDeliveredOrders(): void {
    const id = this.clientIdentification.trim();
    if (!id) return;

    this.loadingOrders = true;
    this.workOrderService.listByClient(id).subscribe({
      next: (orders: WorkOrderResponse[]) => {
        this.deliveredOrders = orders
          .filter(o => o.stateorder === 'ENTREGADO')
          .map(o => ({ id: o.id, numberorder: o.numberorder }));
        this.loadingOrders = false;
      },
      error: () => { this.loadingOrders = false; }
    });
  }

  // ── Formulario ─────────────────────────────────────────────────────────────

  setRating(value: number): void {
    this.rating = value;
    this.errorMsg = '';
  }

  submitSurvey(): void {
    this.errorMsg = '';

    if (!this.isLoggedIn) {
      this.errorMsg = 'Debes iniciar sesión para dejar una reseña.';
      return;
    }
    if (!this.isCliente) {
      this.errorMsg = 'Solo los clientes pueden publicar reseñas.';
      return;
    }
    if (!this.clientIdentification.trim()) {
      this.errorMsg = 'Ingresa tu número de cédula y haz clic en "Buscar".';
      return;
    }
    if (this.rating === 0) {
      this.errorMsg = 'Selecciona una calificación de 1 a 5 estrellas.';
      return;
    }
    if (!this.selectedWorkOrderId) {
      this.errorMsg = 'Selecciona la orden de trabajo que deseas reseñar.';
      return;
    }
    if (this.comment.trim().length < 10) {
      this.errorMsg = 'El comentario debe tener al menos 10 caracteres.';
      return;
    }
    if (this.comment.trim().length > 1000) {
      this.errorMsg = 'El comentario no puede superar los 1000 caracteres.';
      return;
    }

    const payload: ReviewRequestDTO = {
      workOrderId: this.selectedWorkOrderId,
      comment: this.comment.trim(),
      rating: this.rating
    };

    this.loading = true;
    this.reviewService.create(payload).subscribe({
      next: () => {
        this.submitted = true;
        this.loading = false;
        this.toastService.success('¡Reseña publicada exitosamente!');
        this.resetForm();
        this.loadPublicReviews();
        this.loadMyReviews();
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || 'Error al enviar la reseña.';
        this.errorMsg = msg;
        this.toastService.error(msg);
      }
    });
  }

  resetForm(): void {
    this.rating = 0;
    this.hoverRating = 0;
    this.comment = '';
    this.selectedWorkOrderId = null;
    this.errorMsg = '';
    setTimeout(() => (this.submitted = false), 4000);
  }

  // ── Panel ──────────────────────────────────────────────────────────────────

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
    if (this.panelOpen) this.loadPublicReviews();
  }

  setTab(tab: 'all' | 'mine'): void {
    this.activeTab = tab;
    if (tab === 'all') this.loadPublicReviews();
    if (tab === 'mine') this.loadMyReviews();
  }

  onSortChange(): void {
    this.loadPublicReviews();
  }

  // ── Eliminar reseña propia ─────────────────────────────────────────────────

  askDelete(id: number): void { this.confirmDeleteId = id; }
  cancelDelete(): void        { this.confirmDeleteId = null; }

  confirmDelete(id: number): void {
    this.reviewService.deleteOwn(id).subscribe({
      next: () => {
        this.confirmDeleteId = null;
        this.toastService.success('Reseña eliminada.');
        this.myReviews = this.myReviews.filter(r => r.id !== id);
        this.publicReviews = this.publicReviews.filter(r => r.id !== id);
      },
      error: (err) => {
        this.confirmDeleteId = null;
        this.toastService.error(err?.error?.message || 'Error al eliminar.');
      }
    });
  }

  // ── Moderar (admin) ────────────────────────────────────────────────────────

  moderateReview(id: number): void {
    this.reviewService.moderate(id).subscribe({
      next: () => {
        this.toastService.success('Reseña moderada y eliminada.');
        this.publicReviews = this.publicReviews.filter(r => r.id !== id);
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Error al moderar.');
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  getInitials(username: string): string {
    return (username || '?')
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase())
      .join('');
  }

  get avgRating(): string {
    if (!this.publicReviews.length) return '0.0';
    const sum = this.publicReviews.reduce((a, r) => a + r.rating, 0);
    return (sum / this.publicReviews.length).toFixed(1);
  }

  get charCount(): number      { return this.comment.length; }
  get charRemaining(): number  { return 1000 - this.comment.length; }
  get isOverLimit(): boolean   { return this.comment.length > 1000; }
  get starsArray(): number[]   { return [1, 2, 3, 4, 5]; }
}