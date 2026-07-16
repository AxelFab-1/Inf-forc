import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule], 
  templateUrl: './ejercicios.html',
  styleUrl: './ejercicios.css',
})
export class Ejercicios implements OnInit {

  ejercicios: any[] = [];
  ejerciciosFiltrados: any[] = [];
  textoBusqueda: string = '';
  filtroGrupo: string = '';
  readonly gruposMusculares = ['pecho', 'espalda', 'piernas', 'hombros', 'brazos', 'core', 'full body'];

  modo: 'crear' | 'editar' = 'crear';
  ejercicioSeleccionado: any = null;
  ejercicioEditandoId: string = ''; 
  archivoSeleccionado: File | null = null;

  registroForm: FormGroup;
  editarForm: FormGroup;

  alerta: { tipo: 'success' | 'danger'; mensaje: string } | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private adminService: AdminService,
    private fb: FormBuilder 
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      grupoMuscular: ['', [Validators.required]],
      subGrupo: [''],
      tipo: ['fuerza', [Validators.required]],
      categoria: ['pesas', [Validators.required]],
      series: [4, [Validators.required, Validators.min(1)]],
      repeticiones: ['10-12', [Validators.required]],
      pesoCorporal: [false],
      videoUrl: ['']
    });

    this.editarForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      grupoMuscular: ['', [Validators.required]],
      subGrupo: [''],
      tipo: ['fuerza', [Validators.required]],
      categoria: ['pesas', [Validators.required]],
      series: [4, [Validators.required, Validators.min(1)]],
      repeticiones: ['10-12', [Validators.required]],
      pesoCorporal: [false],
      videoUrl: ['']
    });
  }

  ngOnInit() {
    this.cargarEjercicios();
  }

  cargarEjercicios() {
    this.adminService.getEjercicios().subscribe({
      next: (data) => {
        if (data.exito) {
          this.ejercicios = data.datos;
          this.aplicarFiltros();
          this.cdr.detectChanges();
        }
      },
      error: () => this.mostrarAlerta('danger', 'Error al conectar con el servidor.')
    });
  }

  aplicarFiltros() {
    let resultado = [...this.ejercicios];
    if (this.textoBusqueda.trim()) {
      const texto = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(e => e.nombre?.toLowerCase().includes(texto));
    }
    if (this.filtroGrupo) {
      resultado = resultado.filter(e => e.grupoMuscular === this.filtroGrupo);
    }
    this.ejerciciosFiltrados = resultado;
    this.cdr.detectChanges();
  }

  limpiarFiltros() {
    this.textoBusqueda = '';
    this.filtroGrupo = '';
    this.aplicarFiltros();
  }

  seleccionarEjercicio(ejer: any) {
    this.modo = 'editar';
    this.ejercicioSeleccionado = ejer;
    this.ejercicioEditandoId = ejer.id || ejer._id; 
    this.archivoSeleccionado = null;

    this.editarForm.patchValue({
      nombre: ejer.nombre,
      grupoMuscular: ejer.grupoMuscular,
      subGrupo: ejer.subGrupo,
      tipo: ejer.tipo,
      categoria: ejer.categoria,
      series: ejer.series,
      repeticiones: ejer.repeticiones,
      pesoCorporal: ejer.pesoCorporal,
      videoUrl: ejer.videoUrl
    });

    this.alerta = null;
    this.cdr.detectChanges();
  }

  limpiarPanel() {
    this.modo = 'crear';
    this.ejercicioSeleccionado = null;
    this.ejercicioEditandoId = '';
    this.archivoSeleccionado = null;
    this.registroForm.reset({
      series: 4, 
      repeticiones: '10-12',
      tipo: 'fuerza',
      categoria: 'pesas',
      pesoCorporal: false
    });
    this.alerta = null;
    this.cdr.detectChanges();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  crearEjercicio() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      this.mostrarAlerta('danger', 'Completa todos los campos correctamente.');
      return;
    }
    
    if (!this.archivoSeleccionado) {
      this.mostrarAlerta('danger', 'Debes seleccionar un GIF.');
      return;
    }

    const formData = new FormData();
    formData.append('ejercicio', JSON.stringify(this.registroForm.value));
    formData.append('imagen', this.archivoSeleccionado);

    this.adminService.crearEjercicio(formData).subscribe({
      next: (data) => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Ejercicio agregado al catálogo.');
          this.limpiarPanel();
          this.cargarEjercicios();
        }
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'Error al guardar el ejercicio.';
        this.mostrarAlerta('danger', mensajeError);
      }
    });
  }

  guardarEdicion() {
    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();
      this.mostrarAlerta('danger', 'Completa todos los campos.');
      return;
    }

    const formData = new FormData();
    formData.append('ejercicio', JSON.stringify(this.editarForm.value));
    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    }

    this.adminService.actualizarEjercicio(this.ejercicioEditandoId, formData).subscribe({
      next: (data) => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Ejercicio actualizado correctamente.');
          this.cargarEjercicios();
          this.limpiarPanel();
        }
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'No se pudo actualizar el ejercicio.';
        this.mostrarAlerta('danger', mensajeError);
      }
    });
  }

  eliminarEjercicio() {
    if (!this.ejercicioSeleccionado) return;
    
    const idEliminar = this.ejercicioEditandoId; 
    const confirmado = confirm(`¿Estás seguro de eliminar "${this.ejercicioSeleccionado.nombre}"?`);
    if (!confirmado) return;

    this.adminService.eliminarEjercicio(idEliminar).subscribe({
      next: (data) => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Ejercicio eliminado.');
          this.cargarEjercicios();
          if (this.ejercicioSeleccionado?.id === idEliminar || this.ejercicioSeleccionado?._id === idEliminar) {
            this.limpiarPanel();
          }
        }
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'No se pudo eliminar.';
        this.mostrarAlerta('danger', mensajeError);
      }
    });
  }

  mostrarAlerta(tipo: 'success' | 'danger', mensaje: string) {
    this.alerta = { tipo, mensaje };
    this.cdr.detectChanges();
    if (tipo === 'success') {
      setTimeout(() => { this.alerta = null; this.cdr.detectChanges(); }, 3000);
    }
  }

  cerrarAlerta() { this.alerta = null; }
}
