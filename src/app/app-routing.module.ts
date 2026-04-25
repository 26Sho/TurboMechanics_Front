import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './features/auth/pages/auth/auth.component';
import { RecoverPasswordComponent } from './features/auth/pages/recover-password/recover-password.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

const routes: Routes = [
  // Rutas públicas
  { path: '',               component: HomeComponent },
  { path: 'home',           component: HomeComponent },

  // Rutas solo para NO autenticados (si ya iniciaste sesión te manda al home)
  { path: 'login',             component: AuthComponent,            canActivate: [noAuthGuard] },
  { path: 'recover-password',  component: RecoverPasswordComponent, canActivate: [noAuthGuard] },

  // Ruta comodín
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }