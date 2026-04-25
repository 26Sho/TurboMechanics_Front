import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Toast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe(t => this.toasts = t);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  remove(id: number): void {
    this.toastService.remove(id);
  }

  icon(type: string): string {
    return {
      success: 'uil-check-circle',
      error:   'uil-exclamation-circle',
      warning: 'uil-exclamation-triangle',
      info:    'uil-info-circle'
    }[type] ?? 'uil-info-circle';
  }
}