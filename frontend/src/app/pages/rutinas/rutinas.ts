import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { obtenerCabeceras } from '../../shared/utils/auth-headers';
import { decodificarToken } from '../../shared/utils/jwt-decoder';
import { API_URL } from '../../shared/utils/api-config';


@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rutinas.html',
  styleUrl: './rutinas.css',
})
export class Rutinas implements OnInit {
  todasLasPlantillas: any[] = [];
  plantillasMostradas: any[] = [];
  tipoSeleccionado: string = 'predeterminada';

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {
    this.cargarPlantillas();
  }

  cargarPlantillas() {
    fetch(`${API_URL}/api/plantillas`, {
      headers: obtenerCabeceras(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.exito) {
          this.todasLasPlantillas = data.datos;
          this.filtrarPlantillas('predeterminada');
        }
      })
      .catch((error) => console.error('Error fetching plantillas:', error));
  }

  filtrarPlantillas(tipo: string) {
    this.tipoSeleccionado = tipo;
    this.plantillasMostradas = this.todasLasPlantillas.filter((p) => p.tipo === tipo);
    this.cdr.detectChanges();
  }

  seleccionarPlantilla(plantilla: any) {
    const token = localStorage.getItem('jwt_token');
    let idCliente = null;

    if (token) {
      const datosUsuario = decodificarToken(token);
      if (datosUsuario && datosUsuario.id) {
        idCliente = datosUsuario.id;
      }
    }

    if (!idCliente) {
      alert('Error: Sesión inválida o expirada. Inicie sesión nuevamente.');
      this.router.navigate(['/']);
      return;
    }

    if (plantilla.tipo === 'predeterminada') {
      const rutinaSocio = {
        clienteId: idCliente,
        nombreOriginal: plantilla.nombre,
        estado: 'activa',
        fechaAsignacion: new Date().toISOString(),
        dias: plantilla.dias,
      };

      fetch(`${API_URL}/api/rutinas-socios`, {
        method: 'POST',
        headers: obtenerCabeceras(),
        body: JSON.stringify(rutinaSocio),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.exito) {
            this.router.navigate(['/dashboard']);
          } else {
            alert('Error: ' + data.mensaje);
          }
        })
        .catch((error) => console.error('Error:', error));
    } else {
      this.router.navigate(['/armar-rutina', plantilla._id]);
    }
  }
}
