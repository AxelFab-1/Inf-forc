import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { decodificarToken } from '../utils/jwt-decoder';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
      this.router.navigate(['/']);
      return false;
    }

    const datosUsuario = decodificarToken(token);

    if (!datosUsuario) {
      localStorage.clear();
      this.router.navigate(['/']);
      return false;
    }

    const expectedRole = route.data['expectedRole'];
    const userRole = datosUsuario.rol;

    if (expectedRole && userRole !== expectedRole) {
      if (userRole === 'administrador') {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }
      return false;
    }

    return true;
  }
}
