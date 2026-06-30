import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { decodificarToken } from '../../shared/utils/jwt-decoder';

// 👇 Importamos el servicio central de entrenamiento
import { EntrenamientoService } from '../../services/entrenamiento';

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

  // 👇 Inyectamos el servicio en el constructor
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private entrenamientoService: EntrenamientoService
  ) {}

  ngOnInit() {
    this.cargarPlantillas();
  }

  // 👇 Refactorizado para usar el Servicio
  cargarPlantillas() {
    this.entrenamientoService.getPlantillas().subscribe({
      next: (data) => {
        if (data.exito) {
          this.todasLasPlantillas = data.datos;
          this.filtrarPlantillas('predeterminada');
        }
      },
      error: (error) => console.error('Error fetching plantillas:', error)
    });
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

      // 👇 Refactorizado para usar el Servicio
      this.entrenamientoService.asignarRutina(rutinaSocio).subscribe({
        next: (data) => {
          if (data.exito) {
            this.router.navigate(['/dashboard']);
          } else {
            alert('Error: ' + data.mensaje);
          }
        },
        error: (error) => console.error('Error:', error)
      });
    } else {
      this.router.navigate(['/armar-rutina', plantilla._id]);
    }
  }
}