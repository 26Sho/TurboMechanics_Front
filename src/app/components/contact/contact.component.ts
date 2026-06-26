import { Component } from '@angular/core';

export interface ContactChannel {
  iconClass: string;
  iconType: string;
  label: string;
  value: string;
  detail: string;
  href: string;
  /** true = enlace web normal (debe abrir en pestaña nueva).
   *  false = protocolo del sistema (tel:), no debe usar target="_blank"
   *  porque abre una pestaña vacía mientras intenta lanzar la app de llamadas. */
  external: boolean;
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
      value: '+57 321 213 9466',
      detail: 'Respuesta inmediata',
      href: 'https://wa.me/573212139466',
      external: true
    },
    {
      iconClass: 'fas fa-phone',
      iconType: 'phone',
      label: 'Llamada',
      value: '+57 321 213 9466',
      detail: 'Lun–Sáb 7am–6pm',
      href: 'tel:+573212139466',
      external: false
    },
    {
      iconClass: 'fas fa-envelope',
      iconType: 'email',
      label: 'Correo',
      value: 'TurboMechanicsTaller@gmail.com',
      detail: 'Respuesta en 24h',
      // Gmail "compose" directo en el navegador, en vez de mailto:
      // (mailto: abre el cliente de correo predeterminado del sistema, que en
      // Windows suele ser Outlook aunque el usuario use Gmail).
      href: 'https://mail.google.com/mail/?view=cm&fs=1&to=TurboMechanicsTaller@gmail.com&su=Consulta%20TurboMechanics',
      external: true
    }
  ];
}