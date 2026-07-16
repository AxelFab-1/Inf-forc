import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { Header } from "../../shared/header/header";
import { FooterMenu } from "../../shared/footer-menu/footer-menu";

import { EntrenamientoService } from '../../services/entrenamiento';

@Component({
  selector: 'app-entrenar',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, FooterMenu],
  templateUrl: './entrenar.html',
  styleUrl: './entrenar.css',
})
export class Entrenar implements OnInit {
  rutinaActiva: any = null;
  cargandoRutina: boolean = true;
  indiceDiaSiguiente: number = 0;
  diaElegido: any = null;

  catalogoEjercicios: any[] = [];
  rutinaEnModal: any = null;

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
    this.cargarRutinaActiva();
  }

  cargarRutinaActiva() {
    this.cargandoRutina = true;

    this.entrenamientoService.getMiRutina().subscribe({
      next: (data) => {
        if (data.exito && data.datos) {
          this.rutinaActiva = data.datos;
          const totalDias = this.rutinaActiva.dias?.length || 1;
          this.cargarIndiceSiguienteDia(totalDias);
        } else {
          this.rutinaActiva = null;
          this.cargandoRutina = false;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.rutinaActiva = null;
        this.cargandoRutina = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarIndiceSiguienteDia(totalDias: number) {
    this.entrenamientoService.getSiguienteDia(totalDias).subscribe({
      next: (data) => {
        if (data.exito) {
          this.indiceDiaSiguiente = data.indiceDia;
        } else {
          this.indiceDiaSiguiente = 0;
        }
        this.diaElegido = this.rutinaActiva?.dias?.[this.indiceDiaSiguiente] || null;
        this.cargandoRutina = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.indiceDiaSiguiente = 0;
        this.diaElegido = this.rutinaActiva?.dias?.[0] || null;
        this.cargandoRutina = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalInfo() {
    if (!this.rutinaActiva) return;
    
    this.rutinaEnModal = JSON.parse(JSON.stringify(this.rutinaActiva)); // Copia profunda

    // Cruzar ejercicios con catálogo para obtener GIFs y grupo
    if (this.rutinaEnModal.dias) {
      this.rutinaEnModal.dias.forEach((dia: any) => {
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
    
    const modalEl = document.getElementById('infoMiRutinaModal');
    if (modalEl) {
      // @ts-ignore
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  iniciarEntrenamiento() {
    if (!this.rutinaActiva || !this.diaElegido) return;

    this.router.navigate(['/sesion-entrenamiento'], {
      state: {
        dia: this.diaElegido,
        rutinaId: this.rutinaActiva._id || this.rutinaActiva.id,
        indiceDia: this.indiceDiaSiguiente,
      },
    });
  }
}
