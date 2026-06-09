import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { obtenerCabeceras } from '../../shared/utils/auth-headers';
import { decodificarToken } from '../../shared/utils/jwt-decoder';

declare var bootstrap: any;

@Component({
  selector: 'app-armar-rutina',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './armar-rutina.html',
  styleUrl: './armar-rutina.css',
})
export class ArmarRutina implements OnInit {
  idPlantillaUrl: string | null = null;
  plantillaEnConstruccion: any = null;
  catalogoMaquinas: any[] = [];
  diaSeleccionadoIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.idPlantillaUrl = this.route.snapshot.paramMap.get('id');
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    fetch('http://localhost:8090/api/plantillas', {
      headers: obtenerCabeceras(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.exito) {
          this.plantillaEnConstruccion = data.datos.find((p: any) => p._id === this.idPlantillaUrl);
          this.cdr.detectChanges();
        }
      });

    fetch('http://localhost:8090/api/ejercicios', {
      headers: obtenerCabeceras(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.exito) {
          this.catalogoMaquinas = data.datos;
          this.cdr.detectChanges();
        }
      });
  }

  abrirCatalogoParaDia(indiceDia: number) {
    this.diaSeleccionadoIndex = indiceDia;
    const modalElement = document.getElementById('modalCatalogo');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  seleccionarEjercicio(ejercicio: any) {
    if (this.diaSeleccionadoIndex !== null) {
      this.plantillaEnConstruccion.dias[this.diaSeleccionadoIndex].ejerciciosBase.push({
        ejercicioId: ejercicio._id?.$oid || ejercicio._id || ejercicio.id,
        nombre: ejercicio.nombre,
      });

      const modalElement = document.getElementById('modalCatalogo');
      if (modalElement) {
        const modalInstancia = bootstrap.Modal.getInstance(modalElement);
        if (modalInstancia) modalInstancia.hide();
      }

      this.cdr.detectChanges();
    }
  }

  eliminarEjercicio(indiceDia: number, indiceEjercicio: number) {
    this.plantillaEnConstruccion.dias[indiceDia].ejerciciosBase.splice(indiceEjercicio, 1);
    this.cdr.detectChanges();
  }

  guardarRutina() {
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

    const rutinaSocio = {
      clienteId: idCliente,
      nombreOriginal: this.plantillaEnConstruccion.nombre,
      estado: 'activa',
      fechaAsignacion: new Date().toISOString(),
      dias: this.plantillaEnConstruccion.dias,
    };

    fetch('http://localhost:8090/api/rutinas-socios', {
      method: 'POST',
      headers: obtenerCabeceras(),
      body: JSON.stringify(rutinaSocio),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.exito) {
          alert(`¡Rutina ${this.plantillaEnConstruccion.nombre} armada y guardada con éxito!`);
          this.router.navigate(['/dashboard']);
        } else {
          alert('Error al guardar: ' + data.mensaje);
        }
      });
  }
}
