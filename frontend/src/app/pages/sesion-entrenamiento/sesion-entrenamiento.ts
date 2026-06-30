import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// 👇 Importamos el nuevo servicio
import { EntrenamientoService } from '../../services/entrenamiento'; 

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
  // Datos del día de entrenamiento
  diaActual: any = null;
  rutinaId: string = '';
  indiceDia: number = 0;

  // Catálogo completo de ejercicios
  catalogoEjercicios: { [id: string]: any } = {};
  cargandoCatalogo: boolean = true;

  // Cronómetro
  reloj: string = '00:00:00';
  segundosTotales: number = 0;
  private intervaloCronometro: any;

  // Registro de series por ejercicio
  registroSeries: { [ejercicioId: string]: SerieFila[] } = {};

  // Control de UI
  ejercicioExpandido: string | null = null;
  videoActivo: string | null = null;

  // Modal de advertencia
  ejerciciosSinDatos: string[] = [];
  mostrarModalAdvertencia: boolean = false;

  private fechaInicio: string = '';

  // 👇 Inyectamos el servicio en el constructor
  constructor(
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private entrenamientoService: EntrenamientoService
  ) {}

  ngOnInit() {
    const state = history.state;
    if (!state || !state.dia) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.diaActual = state.dia;
    this.rutinaId = state.rutinaId || '';
    this.indiceDia = state.indiceDia ?? 0;
    this.fechaInicio = new Date().toISOString();

    this.inicializarRegistroSeries();
    this.cargarCatalogoEjercicios();
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

  // 👇 Refactorizado para usar el Servicio
  private cargarCatalogoEjercicios() {
    this.cargandoCatalogo = true;
    
    this.entrenamientoService.getEjercicios().subscribe({
      next: (data) => {
        if (data.exito && data.datos) {
          for (const ej of data.datos) {
            const id = ej._id?.$oid || ej._id || ej.id;
            if (id) this.catalogoEjercicios[id] = ej;
          }
        }
        this.cargandoCatalogo = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoCatalogo = false;
        this.cdr.detectChanges();
      }
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
    if (series.length <= 1) return; 
    series.splice(index, 1);
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

  // 👇 Refactorizado para usar el Servicio
  private guardarYSalir() {
    clearInterval(this.intervaloCronometro);

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

    this.entrenamientoService.guardarSesion(sesion).subscribe({
      next: () => {
        this.router.navigate(['/dashboard'], { state: { sesionCompletada: true } });
      },
      error: () => {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  // ─── Salir sin guardar ────────────────────────────────────────
  salirSinGuardar() {
    clearInterval(this.intervaloCronometro);
    this.router.navigate(['/dashboard']);
  }
}
