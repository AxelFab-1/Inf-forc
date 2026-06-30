import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { decodificarToken } from '../utils/jwt-decoder';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  codigoSocio: string = '00000';
  avatarUrl: string = '';
  menuAbierto: boolean = false;
  mostrarModalCambioClave: boolean = false;

  // 👇 Objeto que coincide con el PasswordChangeDTO del backend
  passData = {
    claveActual: '',
    nuevaClave: '',
    confirmarNuevaClave: ''
  };

  mensajeModal: { tipo: 'success' | 'danger'; texto: string } | null = null;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    let nombreSocio = 'Socio';
    const token = localStorage.getItem('jwt_token');

    if (token) {
      const datosUsuario = decodificarToken(token);
      if (datosUsuario) {
        nombreSocio = datosUsuario.nombres || nombreSocio;
        this.codigoSocio = datosUsuario.codigo || this.codigoSocio;
      }
    }
    this.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreSocio)}&background=ffd700&color=000`;
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  abrirModalCambioClave() {
    this.menuAbierto = false;
    this.mostrarModalCambioClave = true;
    this.passData = { claveActual: '', nuevaClave: '', confirmarNuevaClave: '' };
    this.mensajeModal = null;
  }

  cerrarModalCambioClave() {
    this.mostrarModalCambioClave = false;
    this.mensajeModal = null;
  }

  guardarNuevaClave() {
    this.mensajeModal = null;

    // Aunque el HTML desactiva el botón, esta es una capa extra de seguridad
    if (this.passData.nuevaClave !== this.passData.confirmarNuevaClave) {
      this.mensajeModal = { tipo: 'danger', texto: 'Las contraseñas no coinciden.' };
      return;
    }

    // 👇 Enviamos el objeto completo (el DTO) al backend
    this.authService.cambiarPassword(this.passData).subscribe({
      next: (data: any) => {
        if (data.exito) {
          this.mensajeModal = { tipo: 'success', texto: data.mensaje };
          this.cdr.detectChanges();
          
          setTimeout(() => {
            this.cerrarModalCambioClave();
            this.cdr.detectChanges();
          }, 2000);
        } else {
          this.mensajeModal = { tipo: 'danger', texto: data.mensaje };
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        // 👇 AQUÍ ES DONDE CAPTURAMOS EL MENSAJE DEL BACKEND
        // err.error.mensaje viene de tu ResponseEntity.badRequest().body(respuesta)
        const errorMsg = err.error?.mensaje || 'Error al actualizar la contraseña.';
        this.mensajeModal = { tipo: 'danger', texto: errorMsg };
        this.cdr.detectChanges();
      }
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
