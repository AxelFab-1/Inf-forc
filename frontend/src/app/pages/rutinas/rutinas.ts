import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { decodificarToken } from '../../shared/utils/jwt-decoder';

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

  catalogoEjercicios: any[] = [];
  plantillaEnModal: any = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private entrenamientoService: EntrenamientoService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.entrenamientoService.getEjercicios().subscribe({
      next: (data) => {
        if (data.exito) {
          this.catalogoEjercicios = data.datos;
        }
      },
      error: (err) => console.error('Error fetching ejercicios', err)
    });

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

  abrirModalInfo(plantilla: any) {
    this.plantillaEnModal = JSON.parse(JSON.stringify(plantilla)); // Copia profunda

    // Cruzar ejercicios con catálogo para obtener GIFs y grupo
    if (this.plantillaEnModal.dias) {
      this.plantillaEnModal.dias.forEach((dia: any) => {
        if (dia.ejerciciosBase) {
          dia.ejerciciosBase.forEach((ejRutina: any) => {
            const ejCat = this.catalogoEjercicios.find(e => e.id === ejRutina.ejercicioId || e._id === ejRutina.ejercicioId);
            if (ejCat) {
              ejRutina.imagenUrl = ejCat.imagenUrl;
              ejRutina.grupoMuscular = ejCat.grupoMuscular;
            }
          });
        }
      });
    }
    
    this.cdr.detectChanges();
    
    const modalEl = document.getElementById('infoPlantillaModal');
    if (modalEl) {
      // @ts-ignore
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
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

      this.entrenamientoService.asignarRutina(rutinaSocio).subscribe({
        next: (data) => {
          if (data.exito) {
            this.router.navigate(['/dashboard']);
          } else {
            alert('Error: ' + data.mensaje);
          }
        },
        error: (err) => {
          const mensaje = err.error?.mensaje || 'Error al asignar la rutina.';
          alert('Error: ' + mensaje);
        }
      });
    } else {
      const idPlantilla = plantilla._id?.$oid || plantilla._id || plantilla.id;
      this.router.navigate(['/armar-rutina', idPlantilla]);
    }
  }
}