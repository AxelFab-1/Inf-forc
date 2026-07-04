import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { AdminLayout } from './pages/admin-layout/admin-layout';
import { Usuarios } from './pages/usuarios/usuarios';
import { Inventario } from './pages/inventario/inventario';
import { Entrenar } from './pages/entrenar/entrenar';
import { Catalogo } from './pages/catalogo/catalogo';
import { ArmarRutina } from './pages/armar-rutina/armar-rutina';
import { Rutinas } from './pages/rutinas/rutinas';
import { SesionEntrenamiento } from './pages/sesion-entrenamiento/sesion-entrenamiento';
import { HistorialEntrenamiento } from './pages/historial-entrenamiento/historial-entrenamiento';
import { Nutricion } from './pages/nutricion/nutricion';
import { AuthGuard } from './shared/guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Login },

  { path: 'dashboard',              component: Dashboard,             canActivate: [AuthGuard], data: { expectedRole: 'cliente' } },
  { path: 'entrenar',               component: Entrenar,              canActivate: [AuthGuard], data: { expectedRole: 'cliente' } },
  { path: 'catalogo',               component: Catalogo,              canActivate: [AuthGuard], data: { expectedRole: 'cliente' } },
  { path: 'rutinas',                component: Rutinas,               canActivate: [AuthGuard], data: { expectedRole: 'cliente' } },
  { path: 'armar-rutina/:id',       component: ArmarRutina,           canActivate: [AuthGuard], data: { expectedRole: 'cliente' } },
  { path: 'sesion-entrenamiento',   component: SesionEntrenamiento,   canActivate: [AuthGuard], data: { expectedRole: 'cliente' } },
  { path: 'historial-entrenamiento',component: HistorialEntrenamiento,canActivate: [AuthGuard], data: { expectedRole: 'cliente' } },
  { path: 'nutricion',              component: Nutricion,             canActivate: [AuthGuard], data: { expectedRole: 'cliente' } },

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [AuthGuard],
    data: { expectedRole: 'administrador' },
    children: [
      { path: '',          redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios',  component: Usuarios },
      { path: 'inventario',component: Inventario },
    ],
  },

  { path: 'admin-dashboard', redirectTo: '/admin/usuarios', pathMatch: 'full' },

  { path: '**', redirectTo: '' },
];
