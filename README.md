# TurboMechanics — Angular 17

Proyecto frontend del taller TurboMechanics construido con **Angular 17** modular (`standalone: false`).

---

## 🚀 Cómo ejecutar el proyecto

### 1. Requisitos previos
- Node.js **18.x** o superior → https://nodejs.org
- Angular CLI 17 instalado globalmente

```bash
npm install -g @angular/cli@17
```

### 2. Instalar dependencias

```bash
cd turbomechanics-angular
npm install
```

### 3. Ejecutar en desarrollo

```bash
ng serve
```

Abrir en el navegador: **http://localhost:4200**

### 4. Compilar para producción

```bash
ng build
```

Los archivos compilados quedan en `dist/turbomechanics-angular/`.

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── navbar/          ← Barra de navegación fija + scroll activo
│   │   ├── login-modal/     ← Modal de login con ngModel
│   │   ├── hero/            ← Sección principal con rueda animada
│   │   ├── about/           ← Sección "Nosotros"
│   │   ├── services/        ← Tarjetas de servicios con *ngFor
│   │   ├── location/        ← Mapa Google Maps (Armenia, Quindío)
│   │   ├── contact/         ← Canales de contacto
│   │   └── footer/          ← Pie de página
│   ├── app.component.*      ← Componente raíz, maneja estado del modal
│   └── app.module.ts        ← Módulo principal (standalone: false)
├── assets/
│   └── Logo_turbo_final.webp
├── styles.scss              ← Estilos globales + variables SCSS
└── index.html
```

---

## 🎨 Paleta de colores

| Color | Hex | Uso |
|-------|-----|-----|
| Negro intenso | `#0D0D0D` | Fondo principal |
| Gris oscuro | `#2B2B2B` | Secciones alternas |
| Gris medio | `#6E6E6E` | Textos secundarios |
| Gris claro | `#CFCFCF` | Rim / detalles |
| Rojo intenso | `#D62828` | Inicio de llama |
| Naranja | `#F45D01` | Color principal |
| Naranja claro | `#FF8C00` | Hover |
| Amarillo | `#FFD60A` | Llama caliente |
| Blanco | `#FFFFFF` | Texto principal |

---

## 📦 Despliegue en Netlify

```bash
ng build
# Arrastra la carpeta dist/turbomechanics-angular/browser a netlify.com/drop
```
