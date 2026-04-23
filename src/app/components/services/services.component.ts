import { Component } from '@angular/core';

export interface Service {
  number: string;
  icon: string;
  title: string;
  description: string;
  waText: string;
}

@Component({
  selector: 'app-services',
  standalone: false,
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent {
  services: Service[] = [
    {
      number: '01',
      icon: 'fas fa-oil-can',
      title: 'Cambio de aceite',
      description: 'Cambio de aceite y filtro según especificaciones del fabricante para proteger el motor en uso diario.',
      waText: 'Quiero%20cotizar%20cambio%20de%20aceite'
    },
    {
      number: '02',
      icon: 'fas fa-cog',
      title: 'Mantenimiento preventivo',
      description: 'Revisión completa para anticipar fallas, reducir costos y extender la vida útil de tu vehículo.',
      waText: 'Quiero%20cotizar%20mantenimiento%20preventivo'
    },
    {
      number: '03',
      icon: 'fas fa-tachometer-alt',
      title: 'Sincronización',
      description: 'Ajuste preciso del motor para mejorar rendimiento, estabilizar el encendido y reducir consumo de combustible.',
      waText: 'Quiero%20cotizar%20sincronizaci%C3%B3n'
    },
    {
      number: '04',
      icon: 'fas fa-circle-notch',
      title: 'Frenos',
      description: 'Inspección, cambio de pastillas y rectificación de discos. Frena con total seguridad en cualquier condición.',
      waText: 'Quiero%20cotizar%20frenos'
    },
    {
      number: '05',
      icon: 'fas fa-car',
      title: 'Suspensión',
      description: 'Revisión de amortiguadores, muelles y terminales para mejorar estabilidad, confort y seguridad al manejar.',
      waText: 'Quiero%20cotizar%20suspensi%C3%B3n'
    },
    {
      number: '06',
      icon: 'fas fa-bolt',
      title: 'Sistema eléctrico',
      description: 'Diagnóstico y reparación de fallas eléctricas, batería, alternador, luces y sistemas electrónicos del vehículo.',
      waText: 'Quiero%20cotizar%20sistema%20el%C3%A9ctrico'
    }
  ];
}
