import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { decodificarToken } from '../utils/jwt-decoder';
import { obtenerCabeceras } from '../utils/auth-headers';

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

  claveActual: string = '';
  nuevaClave: string = '';

  mensajeModal: { tipo: 'success' | 'danger'; texto: string } | null = null;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
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
    this.claveActual = '';
    this.nuevaClave = '';
    this.mensajeModal = null;
  }

  cerrarModalCambioClave() {
    this.mostrarModalCambioClave = false;
    this.mensajeModal = null;
  }

  guardarNuevaClave() {
    this.mensajeModal = null;

    if (this.claveActual === this.nuevaClave) {
      this.mensajeModal = {
        tipo: 'danger',
        texto: 'La nueva contraseña debe ser diferente a la actual.',
      };
      return;
    }

    const body = {
      claveActual: this.claveActual,
      nuevaClave: this.nuevaClave,
    };

    fetch('http://localhost:8090/api/usuarios/cambiar-password', {
      method: 'PUT',
      headers: obtenerCabeceras(),
      body: JSON.stringify(body),
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 400) {
            throw new Error('La nueva contraseña debe tener un mínimo de 8 caracteres.');
          }
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.mensaje || 'Error al procesar la solicitud.');
        }
        return response.json();
      })
      .then((data) => {
        if (data.exito) {
          this.mensajeModal = { tipo: 'success', texto: '¡' + data.mensaje + '!' };
          this.cdr.detectChanges();

          setTimeout(() => {
            this.cerrarModalCambioClave();
            this.cdr.detectChanges();
          }, 2000);
        } else {
          this.mensajeModal = { tipo: 'danger', texto: data.mensaje };
          this.cdr.detectChanges();
        }
      })
      .catch((error) => {
        this.mensajeModal = {
          tipo: 'danger',
          texto: error.message || 'Error de conexión con el servidor.',
        };
        console.error('Error al cambiar clave:', error);
        this.cdr.detectChanges();
      });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
