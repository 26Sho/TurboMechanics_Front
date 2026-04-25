import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const id = ++this.counter;
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next([...current, { id, type, message }]);
    setTimeout(() => this.remove(id), duration);
  }

  success(message: string)  { this.show(message, 'success'); }
  error(message: string)    { this.show(message, 'error'); }
  info(message: string)     { this.show(message, 'info'); }
  warning(message: string)  { this.show(message, 'warning'); }

  remove(id: number): void {
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next(current.filter(t => t.id !== id));
  }
}