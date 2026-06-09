import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FooterMenu } from '../../shared/footer-menu/footer-menu';
import { Header } from '../../shared/header/header';
import { obtenerCabeceras } from '../../shared/utils/auth-headers';

declare var bootstrap: any;

@Component({
  selector: 'app-historial-entrenamiento',
  standalone: true,
  imports: [CommonModule, FooterMenu, Header],
  templateUrl: './historial-entrenamiento.html',
  styleUrl: './historial-entrenamiento.css',
})
export class HistorialEntrenamiento implements OnInit {

  // ─── Navegación de meses ─────────────────────────────
  anioActual: number = 0;
  mesActual: number = 0;   // 1-12
  mesNombre: string = '';
  diasVacios: number[] = [];
  diasMes: number[] = [];
  diaHoy: number = 0;
  esElMesActual: boolean = false;

  private readonly nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  // ─── Datos de asistencia ─────────────────────────────
  /** Días del mes que tienen asistencia registrada. */
  diasEntrenados: number[] = [];
  /** Mapeo día → sesionId para poder hacer el fetch de detalle. */
  mapaDiaSesionId: { [dia: number]: string } = {};
  cargandoAsistencias: boolean = true;

  // ─── Selección del día ───────────────────────────────
  /** Día que el usuario seleccionó haciendo clic en el calendario. */
  diaSeleccionado: number | null = null;
  sesionIdSeleccionada: string | null = null;

  // ─── Detalle de sesión (para el modal) ───────────────
  cargandoDetalle: boolean = false;
  sesionDetalle: any = null;

  // ─── Mes más antiguo hasta el que navegar ────────────
  private readonly MESES_ATRAS_MAX = 12;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const hoy = new Date();
    this.anioActual = hoy.getFullYear();
    this.mesActual  = hoy.getMonth() + 1; // 1-based
    this.diaHoy     = hoy.getDate();

    this.construirCalendario();
    this.cargarAsistencias();
  }

  // ─── Construcción del calendario ─────────────────────
  private construirCalendario() {
    const mesIndex = this.mesActual - 1; // 0-based para Date
    this.mesNombre = `${this.nombresMeses[mesIndex]} ${this.anioActual}`;

    const hoy = new Date();
    this.esElMesActual =
      this.anioActual === hoy.getFullYear() &&
      this.mesActual  === hoy.getMonth() + 1;

    const primerDia  = new Date(this.anioActual, mesIndex, 1).getDay();
    const espacios   = primerDia === 0 ? 6 : primerDia - 1;
    this.diasVacios  = Array(espacios).fill(0);
    const totalDias  = new Date(this.anioActual, mesIndex + 1, 0).getDate();
    this.diasMes     = Array.from({ length: totalDias }, (_, i) => i + 1);

    // Limpiar selección al cambiar de mes
    this.diaSeleccionado     = null;
    this.sesionIdSeleccionada = null;
    this.sesionDetalle       = null;
  }

  // ─── Carga de asistencias ────────────────────────────
  cargarAsistencias() {
    this.cargandoAsistencias = true;
    this.diasEntrenados      = [];
    this.mapaDiaSesionId     = {};

    fetch(
      `http://localhost:8090/api/asistencias?anio=${this.anioActual}&mes=${this.mesActual}`,
      { headers: obtenerCabeceras() }
    )
      .then(res => res.json())
      .then(data => {
        if (data.exito && data.datos?.registros) {
          for (const r of data.datos.registros) {
            this.diasEntrenados.push(r.dia);
            this.mapaDiaSesionId[r.dia] = r.sesionId;
          }
        }
        this.cargandoAsistencias = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.cargandoAsistencias = false;
        this.cdr.detectChanges();
      });
  }

  // ─── Navegación entre meses ──────────────────────────
  mesAnterior() {
    let mes  = this.mesActual - 1;
    let anio = this.anioActual;

    if (mes < 1) {
      mes  = 12;
      anio = anio - 1;
    }

    // Límite: no navegar más de MESES_ATRAS_MAX meses atrás
    const hoy           = new Date();
    const mesLimiteAnio = hoy.getFullYear();
    const mesLimiteMes  = hoy.getMonth() + 1;

    const mesesDiferencia =
      (hoy.getFullYear() - anio) * 12 + ((hoy.getMonth() + 1) - mes);

    if (mesesDiferencia > this.MESES_ATRAS_MAX) return;

    this.mesActual  = mes;
    this.anioActual = anio;
    this.construirCalendario();
    this.cargarAsistencias();
  }

  mesSiguiente() {
    // No permitir navegar más allá del mes actual
    if (this.esElMesActual) return;

    let mes  = this.mesActual + 1;
    let anio = this.anioActual;

    if (mes > 12) {
      mes  = 1;
      anio = anio + 1;
    }

    this.mesActual  = mes;
    this.anioActual = anio;
    this.construirCalendario();
    this.cargarAsistencias();
  }

  // ─── Selección de día ────────────────────────────────
  seleccionarDia(dia: number) {
    // Solo se puede seleccionar días que tienen asistencia
    if (!this.diasEntrenados.includes(dia)) return;

    if (this.diaSeleccionado === dia) {
      // Clic en el mismo día: deseleccionar
      this.diaSeleccionado      = null;
      this.sesionIdSeleccionada  = null;
    } else {
      this.diaSeleccionado      = dia;
      this.sesionIdSeleccionada  = this.mapaDiaSesionId[dia] || null;
    }
    this.sesionDetalle = null;
    this.cdr.detectChanges();
  }

  // ─── Ver detalle ─────────────────────────────────────
  verDetalle() {
    if (!this.sesionIdSeleccionada) return;

    this.cargandoDetalle = true;
    this.sesionDetalle   = null;

    fetch(
      `http://localhost:8090/api/asistencias/sesion/${this.sesionIdSeleccionada}`,
      { headers: obtenerCabeceras() }
    )
      .then(res => res.json())
      .then(data => {
        if (data.exito && data.datos) {
          this.sesionDetalle = data.datos;
        }
        this.cargandoDetalle = false;
        this.cdr.detectChanges();

        // Abrir modal
        const modalEl = document.getElementById('detalleSesionModal');
        if (modalEl) {
          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        }
      })
      .catch(() => {
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      });
  }

  // ─── Borrar asistencia ───────────────────────────────────────────────────
  borrarAsistencia() {
    if (!this.diaSeleccionado || !this.sesionIdSeleccionada) return;

    // Paso de confirmación obligatorio antes de borrar
    const confirmado = confirm(
      '¿Estás seguro de que deseas eliminar esta sesión de entrenamiento? ' +
      'Esta acción borrará tu progreso y no se puede deshacer.'
    );
    if (!confirmado) return;

    const payload = {
      sesionId: this.sesionIdSeleccionada,
      anio:     this.anioActual,
      mes:      this.mesActual,
      dia:      this.diaSeleccionado,
    };

    fetch('http://localhost:8090/api/asistencias/registro', {
      method:  'DELETE',
      headers: obtenerCabeceras(),
      body:    JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        if (data.exito) {
          const diaEliminado = this.diaSeleccionado!;
          // Actualizar UI sin recargar
          this.diasEntrenados = this.diasEntrenados.filter(d => d !== diaEliminado);
          delete this.mapaDiaSesionId[diaEliminado];
          this.diaSeleccionado      = null;
          this.sesionIdSeleccionada  = null;
          this.sesionDetalle        = null;
          this.cdr.detectChanges();
        }
      })
      .catch(() => {});
  }

  // ─── Helpers de formato ──────────────────────────────
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
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  irAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
