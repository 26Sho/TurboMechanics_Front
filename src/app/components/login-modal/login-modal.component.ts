import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';

@Component({
  selector: 'app-login-modal',
  standalone: false,
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  email = '';
  password = '';

  onOverlayClick(): void {
    this.closeModal.emit();
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    // Aquí va la lógica de autenticación
    console.log('Login:', this.email);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.closeModal.emit();
  }
}
