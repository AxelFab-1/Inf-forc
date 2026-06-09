import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { obtenerCabeceras } from '../../shared/utils/auth-headers';

declare var bootstrap: any;

interface SerieFila {
  numeroSerie: number;
  repeticiones: number | null;
  pesoKg: number | null;
}

@Component({
  selector: 'app-sesion-entrenamiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sesion-entrenamiento.html',
  styleUrl: './sesion-entrenamiento.css',
})
export class SesionEntrenamiento implements OnInit, OnDestroy {
  // Datos del día de entrenamiento (llegan por navigation state)
  diaActual: any = null;
  rutinaId: string = '';
  indiceDia: number = 0;

  // Catálogo completo de ejercicios para enriquecer con imagen/video/pesoCorporal
  catalogoEjercicios: { [id: string]: any } = {};
  cargandoCatalogo: boolean = true;

  // Cronómetro
  reloj: string = '00:00:00';
  segundosTotales: number = 0;
  private intervaloCronometro: any;

  // Registro de series por ejercicio: clave = ejercicioId
  registroSeries: { [ejercicioId: string]: SerieFila[] } = {};

  // Control de UI
  ejercicioExpandido: string | null = null;
  videoActivo: string | null = null;

  // Modal de advertencia al finalizar con ejercicios sin datos
  ejerciciosSinDatos: string[] = [];
  mostrarModalAdvertencia: boolean = false;

  // Fecha de inicio (ISO) para guardar en la sesión
  private fechaInicio: string = '';

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Verificar que hay datos de navegación válidos
    const state = history.state;
    if (!state || !state.dia) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.diaActual = state.dia;
    this.rutinaId = state.rutinaId || '';
    this.indiceDia = state.indiceDia ?? 0;
    this.fechaInicio = new Date().toISOString();

    // Inicializar tabla de series vacía para cada ejercicio (1 fila por defecto)
    this.inicializarRegistroSeries();

    // Cargar catálogo de ejercicios para obtener imagen, video y pesoCorporal
    this.cargarCatalogoEjercicios();

    // Iniciar cronómetro automáticamente
    this.iniciarCronometro();
  }

  ngOnDestroy() {
    clearInterval(this.intervaloCronometro);
  }

  private inicializarRegistroSeries() {
    if (!this.diaActual?.ejerciciosBase) return;

    for (const ej of this.diaActual.ejerciciosBase) {
      const id = this.resolverEjercicioId(ej);
      this.registroSeries[id] = [{ numeroSerie: 1, repeticiones: null, pesoKg: null }];
    }
  }

  private cargarCatalogoEjercicios() {
    this.cargandoCatalogo = true;
    fetch('http://localhost:8090/api/ejercicios', { headers: obtenerCabeceras() })
      .then(res => res.json())
      .then(data => {
        if (data.exito && data.datos) {
          for (const ej of data.datos) {
            const id = ej._id?.$oid || ej._id || ej.id;
            if (id) this.catalogoEjercicios[id] = ej;
          }
        }
        this.cargandoCatalogo = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.cargandoCatalogo = false;
        this.cdr.detectChanges();
      });
  }

  // ─── Helpers de ID ───────────────────────────────────────────
  resolverEjercicioId(ej: any): string {
    return ej.ejercicioId?.$oid || ej.ejercicioId || ej._id?.$oid || ej._id || '';
  }

  getEjercicioCompleto(ej: any): any {
    return this.catalogoEjercicios[this.resolverEjercicioId(ej)] || null;
  }

  esPesoCorporal(ej: any): boolean {
    const completo = this.getEjercicioCompleto(ej);
    return completo?.pesoCorporal === true;
  }

  getImagenUrl(ej: any): string | null {
    return this.getEjercicioCompleto(ej)?.imagenUrl || null;
  }

  getVideoUrl(ej: any): string | null {
    return this.getEjercicioCompleto(ej)?.videoUrl || null;
  }

  // ─── Cronómetro ──────────────────────────────────────────────
  private iniciarCronometro() {
    this.intervaloCronometro = setInterval(() => {
      this.segundosTotales++;
      const h = Math.floor(this.segundosTotales / 3600);
      const m = Math.floor((this.segundosTotales % 3600) / 60);
      const s = this.segundosTotales % 60;
      this.reloj = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      this.cdr.detectChanges();
    }, 1000);
  }

  // ─── Control de acordeón ─────────────────────────────────────
  toggleEjercicio(id: string) {
    this.ejercicioExpandido = this.ejercicioExpandido === id ? null : id;
    this.videoActivo = null;
  }

  toggleVideo(id: string) {
    this.videoActivo = this.videoActivo === id ? null : id;
  }

  // ─── Gestión de series ────────────────────────────────────────
  getSeries(ej: any): SerieFila[] {
    return this.registroSeries[this.resolverEjercicioId(ej)] || [];
  }

  agregarSerie(ej: any) {
    const id = this.resolverEjercicioId(ej);
    const series = this.registroSeries[id];
    series.push({ numeroSerie: series.length + 1, repeticiones: null, pesoKg: null });
    this.cdr.detectChanges();
  }

  eliminarSerie(ej: any, index: number) {
    const id = this.resolverEjercicioId(ej);
    const series = this.registroSeries[id];
    if (series.length <= 1) return; // Mínimo 1 fila
    series.splice(index, 1);
    // Renumerar
    series.forEach((s, i) => (s.numeroSerie = i + 1));
    this.cdr.detectChanges();
  }

  // ─── Verificación de ejercicios vacíos ───────────────────────
  private getEjerciciosSinDatos(): string[] {
    const vacios: string[] = [];
    for (const ej of this.diaActual.ejerciciosBase) {
      const id = this.resolverEjercicioId(ej);
      const series = this.registroSeries[id] || [];
      const tieneAlgunDato = series.some(
        s => (s.repeticiones !== null && s.repeticiones > 0)
      );
      if (!tieneAlgunDato) {
        vacios.push(ej.nombre);
      }
    }
    return vacios;
  }

  // ─── Finalizar sesión ─────────────────────────────────────────
  finalizarSesion() {
    this.ejerciciosSinDatos = this.getEjerciciosSinDatos();

    if (this.ejerciciosSinDatos.length > 0) {
      // Mostrar modal de advertencia
      const modalEl = document.getElementById('advertenciaModal');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
      return;
    }

    this.guardarYSalir();
  }

  confirmarFinalizarConAdvertencia() {
    const modalEl = document.getElementById('advertenciaModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
    this.guardarYSalir();
  }

  private guardarYSalir() {
    clearInterval(this.intervaloCronometro);

    // Construir lista de ejercicios realizados (excluir los sin datos)
    const ejerciciosRealizados: any[] = [];
    for (const ej of this.diaActual.ejerciciosBase) {
      const id = this.resolverEjercicioId(ej);
      const series = (this.registroSeries[id] || []).filter(
        s => s.repeticiones !== null && s.repeticiones > 0
      );
      if (series.length > 0) {
        ejerciciosRealizados.push({
          ejercicioId: id,
          nombre: ej.nombre,
          pesoCorporal: this.esPesoCorporal(ej),
          series: series.map(s => ({
            numeroSerie: s.numeroSerie,
            repeticiones: s.repeticiones,
            pesoKg: this.esPesoCorporal(ej) ? null : s.pesoKg,
          })),
        });
      }
    }

    const sesion = {
      rutinaId: this.rutinaId,
      nombreDia: this.diaActual.nombreDia,
      indiceDia: this.indiceDia,
      fecha: this.fechaInicio,
      duracionSegundos: this.segundosTotales,
      ejerciciosRealizados,
    };

    fetch('http://localhost:8090/api/sesiones', {
      method: 'POST',
      headers: obtenerCabeceras(),
      body: JSON.stringify(sesion),
    })
      .then(res => res.json())
      .then(data => {
        // El backend ya registra la asistencia en la colección 'asistencias' automáticamente.
        // Ya no necesitamos escribir en localStorage.
        this.router.navigate(['/dashboard'], { state: { sesionCompletada: true } });
      })
      .catch(() => {
        // Si falla el guardado, navegamos igualmente al dashboard
        this.router.navigate(['/dashboard']);
      });
  }

  // ─── Salir sin guardar ────────────────────────────────────────
  salirSinGuardar() {
    clearInterval(this.intervaloCronometro);
    this.router.navigate(['/dashboard']);
  }
}
