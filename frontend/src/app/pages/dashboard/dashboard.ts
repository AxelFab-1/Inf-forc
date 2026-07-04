import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterMenu } from '../../shared/footer-menu/footer-menu';
import { Header } from '../../shared/header/header';
import { decodificarToken } from '../../shared/utils/jwt-decoder';

import { EntrenamientoService } from '../../services/entrenamiento';

declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterMenu, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  nombreSocio: string = 'Socio';

  mesActualNombre: string = '';
  diasVacios: number[] = [];
  diasMes: number[] = [];
  diaHoy: number = 0;

  diasEntrenados: number[] = [];
  cargandoAsistencias: boolean = true;

  rutinaActiva: any = null;
  cargandoRutina: boolean = true;
  indiceDiaSiguiente: number = 0;
  diaElegido: any = null;
  modoEleccionDia: boolean = false;
  indiceDiaManual: number = 0;

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private entrenamientoService: EntrenamientoService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const datosUsuario = decodificarToken(token);
      if (datosUsuario?.nombres) {
        this.nombreSocio = datosUsuario.nombres;
      }
    }

    this.configurarCalendario();
    this.cargarAsistenciasMesActual();
    this.cargarRutinaActiva();
  }

  configurarCalendario() {
    const fechaActual = new Date();
    this.diaHoy = fechaActual.getDate();
    const mesHoy   = fechaActual.getMonth(); 
    const anioHoy  = fechaActual.getFullYear();

    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    this.mesActualNombre = `${nombresMeses[mesHoy]} ${anioHoy}`;

    const primerDiaDelMes = new Date(anioHoy, mesHoy, 1).getDay();
    const espacios = primerDiaDelMes === 0 ? 6 : primerDiaDelMes - 1;
    this.diasVacios = Array(espacios).fill(0);
    const totalDiasMes = new Date(anioHoy, mesHoy + 1, 0).getDate();
    this.diasMes = Array.from({ length: totalDiasMes }, (_, i) => i + 1);
  }

  cargarAsistenciasMesActual() {
    this.cargandoAsistencias = true;

    this.entrenamientoService.getAsistenciasMesActual().subscribe({
      next: (data) => {
        if (data.exito && data.datos?.registros) {
          this.diasEntrenados = data.datos.registros.map((r: any) => r.dia);
        } else {
          this.diasEntrenados = [];
        }
        this.cargandoAsistencias = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.diasEntrenados = [];
        this.cargandoAsistencias = false;
        this.cdr.detectChanges();
      }
    });
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
          this.indiceDiaManual = data.indiceDia;
        } else {
          this.indiceDiaSiguiente = 0;
          this.indiceDiaManual = 0;
        }
        this.diaElegido = this.rutinaActiva?.dias?.[this.indiceDiaSiguiente] || null;
        this.cargandoRutina = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.indiceDiaSiguiente = 0;
        this.indiceDiaManual = 0;
        this.diaElegido = this.rutinaActiva?.dias?.[0] || null;
        this.cargandoRutina = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCambioDiaManual() {
    this.diaElegido = this.rutinaActiva?.dias?.[this.indiceDiaManual] || null;
  }

  toggleModoEleccion() {
    this.modoEleccionDia = !this.modoEleccionDia;
    if (!this.modoEleccionDia) {
      this.indiceDiaManual = this.indiceDiaSiguiente;
      this.diaElegido = this.rutinaActiva?.dias?.[this.indiceDiaSiguiente] || null;
    }
    this.cdr.detectChanges();
  }

  iniciarEntrenamiento() {
    if (!this.rutinaActiva) {
      this.router.navigate(['/entrenar']);
      return;
    }

    if (!this.diaElegido) return;

    const modalEl = document.getElementById('entrenamientoModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    this.router.navigate(['/sesion-entrenamiento'], {
      state: {
        dia: this.diaElegido,
        rutinaId: this.rutinaActiva._id || this.rutinaActiva.id,
        indiceDia: this.modoEleccionDia ? this.indiceDiaManual : this.indiceDiaSiguiente,
      },
    });
  }

  irAElegirRutina() {
    this.router.navigate(['/entrenar']);
  }

  irAHistorial() {
    this.router.navigate(['/historial-entrenamiento']);
  }
}
