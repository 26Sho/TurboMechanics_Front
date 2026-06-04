import { Component, OnInit } from '@angular/core';
import { ReviewService, ReviewResponseDTO } from '../../../core/services/review.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-resenas-admin',
  templateUrl: './resenas.component.html',
  styleUrls: ['./resenas.component.scss']
})
export class ResenasAdminComponent implements OnInit {

  reviews: ReviewResponseDTO[] = [];
  loading = false;
  sortBy = 'fecha';
  confirmDeleteId: number | null = null;
  searchTerm = '';

  readonly ratingLabels = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

  constructor(
    private reviewService: ReviewService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.reviewService.listAll(this.sortBy).subscribe({
      next: (data) => { this.reviews = data; this.loading = false; },
      error: () => { this.loading = false; this.toastService.error('Error al cargar reseñas.'); }
    });
  }

  onSortChange(): void { this.loadReviews(); }

  get filtered(): ReviewResponseDTO[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.reviews;
    return this.reviews.filter(r =>
      r.username.toLowerCase().includes(term) ||
      r.comment.toLowerCase().includes(term) ||
      r.workOrderNumber.toLowerCase().includes(term)
    );
  }

  get avgRating(): string {
    if (!this.reviews.length) return '0.0';
    return (this.reviews.reduce((a, r) => a + r.rating, 0) / this.reviews.length).toFixed(1);
  }

  askDelete(id: number): void   { this.confirmDeleteId = id; }
  cancelDelete(): void          { this.confirmDeleteId = null; }

  confirmDelete(id: number): void {
    this.reviewService.moderate(id).subscribe({
      next: () => {
        this.toastService.success('Reseña eliminada por moderación.');
        this.reviews = this.reviews.filter(r => r.id !== id);
        this.confirmDeleteId = null;
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Error al moderar.');
        this.confirmDeleteId = null;
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  getInitials(username: string): string {
    return (username || '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  }

  getRatingColor(rating: number): string {
    if (rating >= 4) return '#00d26a';
    if (rating === 3) return '#ff9900';
    return '#ff4d4d';
  }

  getStars(): number[] { return [1, 2, 3, 4, 5]; }

  countByRating(star: number): number {
    return this.reviews.filter(r => r.rating === star).length;
  }
}
