import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatbotService, ChatMessage } from '../../../core/services/chatbot.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-turbo-bot',
  standalone: false,
  templateUrl: './turbo-bot.component.html',
  styleUrls: ['./turbo-bot.component.scss']
})
export class TurboBotComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  isLoading = false;
  userInput = '';
  messages: ChatMessage[] = [];

  private shouldScrollBottom = false;

  constructor(
    private chatbotService: ChatbotService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const rolId = this.authService.getRolId();
    const username = this.authService.getUsername();
    const welcome = this.getWelcomeMessage(rolId, username);
    this.messages.push({ role: 'bot', text: welcome, timestamp: new Date() });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollBottom) {
      this.scrollToBottom();
      this.shouldScrollBottom = false;
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.shouldScrollBottom = true;
    }
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    this.messages.push({ role: 'user', text, timestamp: new Date() });
    this.userInput = '';
    this.isLoading = true;
    this.shouldScrollBottom = true;

    this.chatbotService.sendMessage(text).subscribe({
      next: (res) => {
        this.messages.push({ role: 'bot', text: res.reply, timestamp: new Date() });
        this.isLoading = false;
        this.shouldScrollBottom = true;
      },
      error: () => {
        this.messages.push({
          role: 'bot',
          text: 'Lo siento, hubo un problema al conectar con el asistente. Intenta de nuevo.',
          timestamp: new Date()
        });
        this.isLoading = false;
        this.shouldScrollBottom = true;
      }
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    const rolId = this.authService.getRolId();
    const username = this.authService.getUsername();
    this.messages = [
      { role: 'bot', text: this.getWelcomeMessage(rolId, username), timestamp: new Date() }
    ];
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private getWelcomeMessage(rolId: number, username: string): string {
    const nombre = username ? `, ${username}` : '';
    switch (rolId) {
      case 3: // ADMIN
        return `¡Hola${nombre}! 👋 Soy Turbo Bot. Puedo ayudarte con dudas sobre gestión del taller, módulos del sistema y buenas prácticas administrativas. ¿En qué te ayudo?`;
      case 2: // MECANICO
        return `¡Hola${nombre}! 🔧 Soy Turbo Bot. Puedo orientarte con consultas técnicas, diagnósticos y el uso de tus módulos de trabajo. ¿Qué necesitas?`;
      case 1: // CLIENTE
      default:
        return `¡Hola${nombre}! 🚗 Soy Turbo Bot, tu asistente del taller TurboMechanics. Puedo ayudarte con información sobre servicios, mantenimiento y el seguimiento de tu vehículo. ¿Cómo puedo ayudarte?`;
    }
  }

  get rolLabel(): string {
    switch (this.authService.getRolId()) {
      case 3: return 'Admin';
      case 2: return 'Mecánico';
      default: return 'Cliente';
    }
  }
}