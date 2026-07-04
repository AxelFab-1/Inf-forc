import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FooterMenu } from '../../shared/footer-menu/footer-menu';
import { Header } from '../../shared/header/header';

import { EntrenamientoService } from '../../services/entrenamiento';

declare var bootstrap: any;

@Component({
  selector: 'app-historial-entrenamiento',
  standalone: true,
  imports: [CommonModule, FooterMenu, Header],
  templateUrl: './historial-entrenamiento.html',
  styleUrl: './historial-entrenamiento.css',
})
export class HistorialEntrenamiento implements OnInit {
  anioActual: number = 0;
  mesActual: number = 0;
  mesNombre: string = '';
  diasVacios: number[] = [];
  diasMes: number[] = [];
  diaHoy: number = 0;
  esElMesActual: boolean = false;

  private readonly nombresMeses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  diasEntrenados: number[] = [];
  mapaDiaSesionId: { [dia: number]: string } = {};
  cargandoAsistencias: boolean = true;

  diaSeleccionado: number | null = null;
  sesionIdSeleccionada: string | null = null;

  cargandoDetalle: boolean = false;
  sesionDetalle: any = null;

  private readonly MESES_ATRAS_MAX = 12;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private entrenamientoService: EntrenamientoService,
  ) {}

  ngOnInit() {
    const hoy = new Date();
    this.anioActual = hoy.getFullYear();
    this.mesActual = hoy.getMonth() + 1;
    this.diaHoy = hoy.getDate();

    this.construirCalendario();
    this.cargarAsistencias();
  }

  private construirCalendario() {
    const mesIndex = this.mesActual - 1;
    this.mesNombre = `${this.nombresMeses[mesIndex]} ${this.anioActual}`;

    const hoy = new Date();
    this.esElMesActual =
      this.anioActual === hoy.getFullYear() && this.mesActual === hoy.getMonth() + 1;

    const primerDia = new Date(this.anioActual, mesIndex, 1).getDay();
    const espacios = primerDia === 0 ? 6 : primerDia - 1;
    this.diasVacios = Array(espacios).fill(0);
    const totalDias = new Date(this.anioActual, mesIndex + 1, 0).getDate();
    this.diasMes = Array.from({ length: totalDias }, (_, i) => i + 1);

    this.diaSeleccionado = null;
    this.sesionIdSeleccionada = null;
    this.sesionDetalle = null;
  }

  cargarAsistencias() {
    this.cargandoAsistencias = true;
    this.diasEntrenados = [];
    this.mapaDiaSesionId = {};

    this.entrenamientoService.getAsistencias(this.anioActual, this.mesActual).subscribe({
      next: (data) => {
        if (data.exito && data.datos?.registros) {
          for (const r of data.datos.registros) {
            this.diasEntrenados.push(r.dia);
            this.mapaDiaSesionId[r.dia] = r.sesionId;
          }
        }
        this.cargandoAsistencias = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoAsistencias = false;
        this.cdr.detectChanges();
      },
    });
  }

  mesAnterior() {
    let mes = this.mesActual - 1;
    let anio = this.anioActual;

    if (mes < 1) {
      mes = 12;
      anio = anio - 1;
    }

    const hoy = new Date();
    const mesesDiferencia = (hoy.getFullYear() - anio) * 12 + (hoy.getMonth() + 1 - mes);

    if (mesesDiferencia > this.MESES_ATRAS_MAX) return;

    this.mesActual = mes;
    this.anioActual = anio;
    this.construirCalendario();
    this.cargarAsistencias();
  }

  mesSiguiente() {
    if (this.esElMesActual) return;

    let mes = this.mesActual + 1;
    let anio = this.anioActual;

    if (mes > 12) {
      mes = 1;
      anio = anio + 1;
    }

    this.mesActual = mes;
    this.anioActual = anio;
    this.construirCalendario();
    this.cargarAsistencias();
  }

  seleccionarDia(dia: number) {
    if (!this.diasEntrenados.includes(dia)) return;

    if (this.diaSeleccionado === dia) {
      this.diaSeleccionado = null;
      this.sesionIdSeleccionada = null;
    } else {
      this.diaSeleccionado = dia;
      this.sesionIdSeleccionada = this.mapaDiaSesionId[dia] || null;
    }
    this.sesionDetalle = null;
    this.cdr.detectChanges();
  }

  verDetalle() {
    if (!this.sesionIdSeleccionada) return;

    this.cargandoDetalle = true;
    this.sesionDetalle = null;

    this.entrenamientoService.getDetalleSesion(this.sesionIdSeleccionada).subscribe({
      next: (data) => {
        if (data.exito && data.datos) {
          this.sesionDetalle = data.datos;
        }
        this.cargandoDetalle = false;
        this.cdr.detectChanges();

        const modalEl = document.getElementById('detalleSesionModal');
        if (modalEl) {
          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        }
      },
      error: () => {
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
    });
  }

  borrarAsistencia() {
    if (!this.diaSeleccionado || !this.sesionIdSeleccionada) return;

    const confirmado = confirm(
      '¿Estás seguro de que deseas eliminar esta sesión de entrenamiento? ' +
        'Esta acción borrará tu progreso y no se puede deshacer.',
    );
    if (!confirmado) return;

    const payload = {
      sesionId: this.sesionIdSeleccionada,
      anio: this.anioActual,
      mes: this.mesActual,
      dia: this.diaSeleccionado,
    };

    this.entrenamientoService.borrarAsistencia(payload).subscribe({
      next: (data) => {
        if (data.exito) {
          const diaEliminado = this.diaSeleccionado!;
          this.diasEntrenados = this.diasEntrenados.filter((d) => d !== diaEliminado);
          delete this.mapaDiaSesionId[diaEliminado];
          this.diaSeleccionado = null;
          this.sesionIdSeleccionada = null;
          this.sesionDetalle = null;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        const mensaje = err.error?.mensaje || 'Ocurrió un error al intentar borrar la sesión.';
        alert('Error: ' + mensaje);
      },
    });
  }

  formatearDuracion(segundos: number): string {
    if (!segundos) return '—';
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  formatearFecha(fechaIso: string): string {
    if (!fechaIso) return '—';
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  irAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
