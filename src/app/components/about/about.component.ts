import { Component } from '@angular/core';

interface AboutCard {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  cards: AboutCard[] = [
    {
      icon: 'fas fa-search-plus',
      title: 'Diagnóstico claro',
      description: 'Evaluación técnica transparente con equipos de última generación. Te explicamos cada detalle del estado de tu vehículo.'
    },
    {
      icon: 'fas fa-tools',
      title: 'Trabajo responsable',
      description: 'Cada servicio se ejecuta con estándares de seguridad, repuestos de calidad y seguimiento para resultados consistentes.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Garantía total',
      description: 'Respaldamos nuestro trabajo con garantía en mano de obra y componentes instalados. Tu seguridad es nuestra prioridad.'
    }
  ];
}
