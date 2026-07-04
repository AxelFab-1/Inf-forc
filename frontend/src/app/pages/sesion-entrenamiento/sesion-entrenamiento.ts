import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EntrenamientoService } from '../../services/entrenamiento';

declare var bootstrap: any;

@Component({
  selector: 'app-sesion-entrenamiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sesion-entrenamiento.html',
  styleUrl: './sesion-entrenamiento.css',
})
export class SesionEntrenamiento implements OnInit, OnDestroy {
  diaActual: any = null;
  rutinaId: string = '';
  indiceDia: number = 0;

  catalogoEjercicios: { [id: string]: any } = {};
  cargandoCatalogo: boolean = true;

  reloj: string = '00:00:00';
  segundosTotales: number = 0;
  private intervaloCronometro: any;

  sesionForm!: FormGroup;

  ejercicioExpandido: string | null = null;
  videoActivo: string | null = null;

  ejerciciosSinDatos: string[] = [];
  mostrarModalAdvertencia: boolean = false;

  private fechaInicio: string = '';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private entrenamientoService: EntrenamientoService,
    private fb: FormBuilder,
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

    this.sesionForm = this.fb.group({
      ejercicios: this.fb.array([]),
    });

    this.inicializarFormularioDinamico();
    this.cargarCatalogoEjercicios();
    this.iniciarCronometro();
  }

  ngOnDestroy() {
    clearInterval(this.intervaloCronometro);
  }

  get ejerciciosFormArray(): FormArray {
    return this.sesionForm.get('ejercicios') as FormArray;
  }

  getSeriesFormArray(indexEjercicio: number): FormArray {
    return this.ejerciciosFormArray.at(indexEjercicio).get('series') as FormArray;
  }

  private inicializarFormularioDinamico() {
    if (!this.diaActual?.ejerciciosBase) return;

    for (const ej of this.diaActual.ejerciciosBase) {
      const ejercicioGroup = this.fb.group({
        id: [this.resolverEjercicioId(ej)],
        nombre: [ej.nombre],
        series: this.fb.array([this.crearSerieFormGroup(1)]),
      });
      this.ejerciciosFormArray.push(ejercicioGroup);
    }
  }

  private crearSerieFormGroup(numeroSerie: number): FormGroup {
    return this.fb.group({
      numeroSerie: [numeroSerie],
      repeticiones: [null, [Validators.min(1), Validators.max(100)]],
      pesoKg: [null, [Validators.min(0), Validators.max(600)]],
    });
  }

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
      },
    });
  }

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

  toggleEjercicio(id: string) {
    this.ejercicioExpandido = this.ejercicioExpandido === id ? null : id;
    this.videoActivo = null;
  }

  toggleVideo(id: string) {
    this.videoActivo = this.videoActivo === id ? null : id;
  }

  agregarSerie(indexEjercicio: number) {
    const series = this.getSeriesFormArray(indexEjercicio);
    series.push(this.crearSerieFormGroup(series.length + 1));
    this.cdr.detectChanges();
  }

  eliminarSerie(indexEjercicio: number, indexSerie: number) {
    const series = this.getSeriesFormArray(indexEjercicio);
    if (series.length <= 1) return;
    series.removeAt(indexSerie);

    series.controls.forEach((control, i) => {
      control.get('numeroSerie')?.setValue(i + 1);
    });
    this.cdr.detectChanges();
  }

  private analizarEjerciciosSinDatos(): string[] {
    const vacios: string[] = [];

    this.ejerciciosFormArray.controls.forEach((ejCtrl) => {
      const nombre = ejCtrl.get('nombre')?.value;
      const seriesArray = ejCtrl.get('series') as FormArray;

      const tieneAlgunDatoValido = seriesArray.controls.some((s) => {
        const reps = s.get('repeticiones')?.value;
        return reps !== null && reps > 0;
      });

      if (!tieneAlgunDatoValido) {
        vacios.push(nombre);
      }
    });

    return vacios;
  }

  finalizarSesion() {
    if (this.sesionForm.invalid) {
      this.sesionForm.markAllAsTouched();
      alert('Por favor, corrige los valores numéricos de las series (Reps > 0 y Pesos válidos).');
      return;
    }

    this.ejerciciosSinDatos = this.analizarEjerciciosSinDatos();

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

  private guardarYSalir() {
    clearInterval(this.intervaloCronometro);
    const ejerciciosRealizados: any[] = [];

    this.ejerciciosFormArray.controls.forEach((ejCtrl, index) => {
      const id = ejCtrl.get('id')?.value;
      const nombre = ejCtrl.get('nombre')?.value;
      const originalEj = this.diaActual.ejerciciosBase[index];
      const pesoCorporal = this.esPesoCorporal(originalEj);

      const seriesArray = ejCtrl.get('series') as FormArray;
      const seriesValidas: any[] = [];

      seriesArray.controls.forEach((sCtrl) => {
        const reps = sCtrl.get('repeticiones')?.value;
        const peso = sCtrl.get('pesoKg')?.value;

        if (reps !== null && reps > 0) {
          seriesValidas.push({
            numeroSerie: sCtrl.get('numeroSerie')?.value,
            repeticiones: reps,
            pesoKg: pesoCorporal ? null : peso || 0,
          });
        }
      });

      if (seriesValidas.length > 0) {
        ejerciciosRealizados.push({
          ejercicioId: id,
          nombre,
          pesoCorporal,
          series: seriesValidas,
        });
      }
    });

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
      error: (err) => {
        const mensaje = err.error?.mensaje || 'No se pudo guardar la sesión en el servidor.';
        alert('Error: ' + mensaje);
      },
    });
  }

  salirSinGuardar() {
    clearInterval(this.intervaloCronometro);
    this.router.navigate(['/dashboard']);
  }
}
