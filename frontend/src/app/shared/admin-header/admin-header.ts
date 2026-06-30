import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { decodificarToken } from '../utils/jwt-decoder';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.css',
})
export class AdminHeader implements OnInit {
  nombreAdmin: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const datos = decodificarToken(token);
      if (datos) {
        this.nombreAdmin = datos.nombres || '';
      }
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
