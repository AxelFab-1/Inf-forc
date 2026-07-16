import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterMenu } from '../../shared/footer-menu/footer-menu';
import { Header } from '../../shared/header/header';
import Chart from 'chart.js/auto';

import { EntrenamientoService } from '../../services/entrenamiento';

declare var bootstrap: any;

@Component({
  selector: 'app-historial-entrenamiento',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterMenu, Header],
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

  // Chart Properties
  chartInstance: Chart | null = null;
  todasSesiones: any[] = [];
  ejerciciosUnicos: string[] = [];
  ejercicioSeleccionado: string = '';
  private observerTema!: MutationObserver;

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
    this.cargarTodasSesiones();
    this.observarCambiosDeTema();
  }

  ngOnDestroy() {
    if (this.observerTema) {
      this.observerTema.disconnect();
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  private observarCambiosDeTema() {
    this.observerTema = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'data-theme') {
          this.actualizarTemaGrafica();
        }
      });
    });
    this.observerTema.observe(document.documentElement, { attributes: true });
  }

  cargarTodasSesiones() {
    this.entrenamientoService.getMiHistorial().subscribe({
      next: (data) => {
        if (data.exito && data.datos) {
          this.todasSesiones = data.datos;
          this.extraerEjerciciosUnicos();
        }
      },
      error: (err) => console.error('Error al cargar historial completo', err)
    });
  }

  extraerEjerciciosUnicos() {
    const setEjercicios = new Set<string>();
    for (const sesion of this.todasSesiones) {
      if (sesion.ejerciciosRealizados) {
        for (const ej of sesion.ejerciciosRealizados) {
          if (!ej.pesoCorporal) {
            setEjercicios.add(ej.nombre);
          }
        }
      }
    }
    this.ejerciciosUnicos = Array.from(setEjercicios).sort();
    if (this.ejerciciosUnicos.length > 0) {
      this.ejercicioSeleccionado = this.ejerciciosUnicos[0];
      setTimeout(() => this.actualizarGraficaProgreso(), 100);
    }
  }

  // --- LÓGICA CHART.JS ---

  procesarDatosGrafica(ejercicioNombre: string) {
    // Filtrar sesiones que tengan el ejercicio y extraer peso máximo
    const dataPoints: { fecha: Date, pesoMaximo: number }[] = [];

    for (const sesion of this.todasSesiones) {
      if (!sesion.ejerciciosRealizados) continue;
      
      const ejercicio = sesion.ejerciciosRealizados.find((e: any) => e.nombre === ejercicioNombre);
      if (ejercicio && ejercicio.series && ejercicio.series.length > 0) {
        let maxPeso = 0;
        for (const serie of ejercicio.series) {
          if (serie.pesoKg && serie.pesoKg > maxPeso) {
            maxPeso = serie.pesoKg;
          }
        }
        if (maxPeso > 0 && sesion.fecha) {
          let fechaObj: Date;
          
          // Spring Boot a veces envía LocalDateTime como Array [Año, Mes, Día, ...]
          if (Array.isArray(sesion.fecha)) {
            fechaObj = new Date(sesion.fecha[0], sesion.fecha[1] - 1, sesion.fecha[2]);
          } else {
            // Si es un string (ISO 8601)
            fechaObj = new Date(sesion.fecha);
          }

          dataPoints.push({
            fecha: fechaObj,
            pesoMaximo: maxPeso
          });
        }
      }
    }

    // Invertir el arreglo ya que el backend lo envía de más reciente a más antiguo
    // asegurando orden cronológico (más antiguo izquierda, reciente derecha)
    dataPoints.reverse();

    const labels = dataPoints.map(dp => {
      if (isNaN(dp.fecha.getTime())) {
        return '—';
      }
      const dia = String(dp.fecha.getDate()).padStart(2, '0');
      const mes = String(dp.fecha.getMonth() + 1).padStart(2, '0');
      return `${dia}/${mes}`;
    });
    const data = dataPoints.map(dp => dp.pesoMaximo);

    return { labels, data };
  }

  actualizarGraficaProgreso() {
    if (!this.ejercicioSeleccionado) return;

    const { labels, data } = this.procesarDatosGrafica(this.ejercicioSeleccionado);
    
    const canvas = document.getElementById('progresoChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const goldColor = rootStyle.getPropertyValue('--gym-gold').trim() || '#D97706';
    const gridColor = rootStyle.getPropertyValue('--gym-border').trim() || '#9CA3AF';
    const textColor = rootStyle.getPropertyValue('--gym-text-muted').trim() || '#374151';

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Peso Máximo (kg)',
          data: data,
          borderColor: goldColor,
          backgroundColor: goldColor,
          borderWidth: 3,
          pointBackgroundColor: goldColor,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} kg`
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: gridColor,
              tickColor: 'transparent'
            },
            ticks: {
              color: textColor,
              font: { family: 'Inter, sans-serif' }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor,
              tickColor: 'transparent'
            },
            ticks: {
              color: textColor,
              font: { family: 'Inter, sans-serif' }
            },
            border: { display: false }
          }
        }
      }
    });
  }

  actualizarTemaGrafica() {
    if (!this.chartInstance) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const goldColor = rootStyle.getPropertyValue('--gym-gold').trim() || '#D97706';
    const gridColor = rootStyle.getPropertyValue('--gym-border').trim() || '#9CA3AF';
    const textColor = rootStyle.getPropertyValue('--gym-text-muted').trim() || '#374151';

    // Aserción de tipo para evitar errores estrictos de TS
    const dataset = this.chartInstance.data.datasets[0] as any;
    dataset.borderColor = goldColor;
    dataset.backgroundColor = goldColor;
    dataset.pointBackgroundColor = goldColor;

    // Actualizar ejes
    if (this.chartInstance.options.scales?.['x']) {
      if (this.chartInstance.options.scales['x'].grid) {
        this.chartInstance.options.scales['x'].grid.color = gridColor;
      }
      if (this.chartInstance.options.scales['x'].ticks) {
        this.chartInstance.options.scales['x'].ticks.color = textColor;
      }
    }
    
    if (this.chartInstance.options.scales?.['y']) {
      if (this.chartInstance.options.scales['y'].grid) {
        this.chartInstance.options.scales['y'].grid.color = gridColor;
      }
      if (this.chartInstance.options.scales['y'].ticks) {
        this.chartInstance.options.scales['y'].ticks.color = textColor;
      }
    }

    this.chartInstance.update();
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
