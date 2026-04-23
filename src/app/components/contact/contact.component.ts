import { Component } from '@angular/core';

export interface ContactChannel {
  iconClass: string;
  iconType: string;
  label: string;
  value: string;
  detail: string;
  href: string;
}

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  channels: ContactChannel[] = [
    {
      iconClass: 'fab fa-whatsapp',
      iconType: 'whatsapp',
      label: 'WhatsApp',
      value: '+57 300 000 0000',
      detail: 'Respuesta inmediata',
      href: 'https://wa.me/573000000000'
    },
    {
      iconClass: 'fas fa-phone',
      iconType: 'phone',
      label: 'Llamada',
      value: '+57 300 000 0000',
      detail: 'Lun–Sáb 7am–6pm',
      href: 'tel:573000000000'
    },
    {
      iconClass: 'fas fa-envelope',
      iconType: 'email',
      label: 'Correo',
      value: 'info@turbomechanics.com',
      detail: 'Respuesta en 24h',
      href: 'mailto:info@turbomechanics.com'
    }
  ];
}
