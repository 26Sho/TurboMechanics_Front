import { Component, OnDestroy, OnInit } from '@angular/core';
import { WhatsappService, WhatsAppSessionResponse } from 'src/app/core/services/whatsapp.service';

@Component({
  standalone: false,
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.scss']
})
export class WhatsappComponent implements OnInit, OnDestroy {
  readonly SESSION_ID = 'admin';

  status: string = 'disconnected';
  qrImage: string | null = null;
  loading = false;
  errorMsg: string | null = null;

  private pollInterval: any = null;

  constructor(private whatsappService: WhatsappService) {}

  ngOnInit(): void {
    this.checkStatus();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  connect(): void {
    this.loading = true;
    this.errorMsg = null;
    this.whatsappService.startSession(this.SESSION_ID).subscribe({
      next: () => {
        this.loading = false;
        this.startPolling();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'No se pudo conectar con el microservicio de WhatsApp.';
      }
    });
  }

  disconnect(): void {
    this.whatsappService.logout(this.SESSION_ID).subscribe({
      next: () => {
        this.status = 'closed';
        this.qrImage = null;
        this.stopPolling();
      }
    });
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollInterval = setInterval(() => this.checkStatus(), 3000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private checkStatus(): void {
    this.whatsappService.getQR(this.SESSION_ID).subscribe({
      next: (res: WhatsAppSessionResponse) => {
        this.status = res.status;
        if (res.status === 'qr_pending' && res.qr) {
          this.qrImage = res.qr;
        }
        if (res.status === 'open') {
          this.qrImage = null;
          this.stopPolling();
        }
      },
      error: () => {
        this.status = 'not_found';
      }
    });
  }

  get statusLabel(): string {
    switch (this.status) {
      case 'open':       return 'Conectado';
      case 'qr_pending': return 'Esperando escaneo...';
      case 'connecting': return 'Conectando...';
      default:           return 'Desconectado';
    }
  }

  get statusClass(): string {
    if (this.status === 'open') return 'open';
    if (this.status === 'qr_pending' || this.status === 'connecting') return 'pending';
    return 'closed';
  }
}