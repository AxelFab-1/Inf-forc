import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NutricionService } from '../../services/nutricion';
import { FormsModule } from '@angular/forms';

import { Header } from '../../shared/header/header';
import { FooterMenu } from '../../shared/footer-menu/footer-menu';

@Component({
  selector: 'app-nutricion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Header, FooterMenu],
  templateUrl: './nutricion.html',
  styleUrl: './nutricion.css',
})
export class Nutricion implements OnInit, AfterViewChecked {

  @ViewChild('chatScroll') chatScroll!: ElementRef;

  cargando: boolean = true;

  mostrarModalPrimeraVez: boolean = false;
  mostrarModalActualizar: boolean = false;

  tienePerfil: boolean = false;
  ultimoRegistro: any = null;

  primeraForm: FormGroup;
  actualizarForm: FormGroup;

  alerta: { tipo: 'success' | 'danger'; mensaje: string } | null = null;
  alertaModal: { tipo: 'success' | 'danger'; mensaje: string } | null = null;
  guardando: boolean = false;

  // Chat
  mensajes: any[] = [];
  textoInput: string = '';
  enviandoMensaje: boolean = false;
  archivoSeleccionado: File | null = null;
  previewImagenSeleccionada: string | null = null;
  cargandoHistorial: boolean = true;
  mostrarChat: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private nutricionService: NutricionService,
    private fb: FormBuilder
  ) {
    this.primeraForm = this.fb.group({
      sexo: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      estaturaCm: [null, [Validators.required, Validators.min(100), Validators.max(250)]],
      pesoKg: [null, [Validators.required, Validators.min(30), Validators.max(300)]],
      nivelActividad: ['', [Validators.required]],
      objetivo: ['', [Validators.required]]
    });

    this.actualizarForm = this.fb.group({
      pesoKg: [null, [Validators.required, Validators.min(30), Validators.max(300)]],
      nivelActividad: ['', [Validators.required]],
      objetivo: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.cargarPerfil();
    this.cargarHistorialChat();
  }

  ngAfterViewChecked() {
    this.scrollAlFinal();
  }

  scrollAlFinal() {
    try {
      if (this.chatScroll) {
        this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
      }
    } catch { }
  }

  cargarPerfil() {
    this.cargando = true;

    this.nutricionService.getPerfil().subscribe({
      next: (data) => {
        if (data.exito) {
          const tieneDatosEstaticos = data.estaturaCm && data.fechaNacimiento;
          this.tienePerfil = !!tieneDatosEstaticos;
          this.ultimoRegistro = data.ultimoRegistro || null;

          if (!this.tienePerfil) {
            this.mostrarModalPrimeraVez = true;
          }
        } else {
          this.mostrarAlerta('danger', data.mensaje || 'Error al cargar el perfil.');
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mostrarAlerta('danger', 'Error de conexión con el servidor.');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarPrimeraEvaluacion() {
    if (this.primeraForm.invalid) {
      this.primeraForm.markAllAsTouched();
      this.alertaModal = { tipo: 'danger', mensaje: 'Por favor, completa todos los campos correctamente.' };
      return;
    }

    this.guardando = true;
    this.alertaModal = null;

    const payload = this.primeraForm.value;

    this.nutricionService.registrarPerfil(payload).subscribe({
      next: (data) => {
        if (data.exito) {
          this.ultimoRegistro = data.ultimoRegistro;
          this.tienePerfil = true;
          this.cerrarModalPrimeraVez();
          this.mostrarAlerta('success', '¡Perfil biométrico creado exitosamente!');
        }
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'Error al guardar.';
        this.alertaModal = { tipo: 'danger', mensaje: mensajeError };
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarActualizacion() {
    if (this.actualizarForm.invalid) {
      this.actualizarForm.markAllAsTouched();
      this.alertaModal = { tipo: 'danger', mensaje: 'Por favor, completa todos los campos correctamente.' };
      return;
    }

    this.guardando = true;
    this.alertaModal = null;

    const payload = this.actualizarForm.value;

    this.nutricionService.registrarPerfil(payload).subscribe({
      next: (data) => {
        if (data.exito) {
          this.ultimoRegistro = data.ultimoRegistro;
          this.cerrarModalActualizar();
          this.mostrarAlerta('success', '¡Datos actualizados correctamente!');
        }
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'Error al actualizar.';
        this.alertaModal = { tipo: 'danger', mensaje: mensajeError };
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalActualizar() {
    this.actualizarForm.patchValue({
      pesoKg: this.ultimoRegistro?.pesoKg || null,
      nivelActividad: this.ultimoRegistro?.nivelActividad || '',
      objetivo: this.ultimoRegistro?.objetivo || '',
    });

    this.alertaModal = null;
    this.mostrarModalActualizar = true;
    this.cdr.detectChanges();
  }

  cerrarModalPrimeraVez() {
    this.mostrarModalPrimeraVez = false;
    this.alertaModal = null;
    this.primeraForm.reset();
    this.cdr.detectChanges();
  }

  cerrarModalActualizar() {
    this.mostrarModalActualizar = false;
    this.alertaModal = null;
    this.actualizarForm.reset();
    this.cdr.detectChanges();
  }

  categoriaIMC(imc: number): string {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  colorIMC(imc: number): string {
    if (imc < 18.5) return '#5bc0de';
    if (imc < 25) return '#5cb85c';
    if (imc < 30) return '#f0ad4e';
    return '#d9534f';
  }

  mostrarAlerta(tipo: 'success' | 'danger', mensaje: string) {
    this.alerta = { tipo, mensaje };
    this.cdr.detectChanges();
    if (tipo === 'success') {
      setTimeout(() => { this.alerta = null; this.cdr.detectChanges(); }, 4000);
    }
  }

  cerrarAlerta() { this.alerta = null; }

  // ===== CHAT NUTRICIÓN IA =====

  cargarHistorialChat() {
    this.cargandoHistorial = true;
    this.nutricionService.getHistorialChat().subscribe({
      next: (data) => {
        if (data.exito) {
          this.mensajes = data.mensajes || [];
        }
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      }
    });
  }

  onImagenSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.archivoSeleccionado = input.files[0];

    const lector = new FileReader();
    lector.onload = () => {
      this.previewImagenSeleccionada = lector.result as string;
      this.cdr.detectChanges();
    };
    lector.readAsDataURL(this.archivoSeleccionado);

    input.value = '';
  }

  quitarImagenSeleccionada() {
    this.archivoSeleccionado = null;
    this.previewImagenSeleccionada = null;
  }

  enviarMensaje() {
    const texto = this.textoInput.trim();
    if (!texto && !this.archivoSeleccionado) return;

    // Mostrar el mensaje del usuario de inmediato (optimista)
    this.mensajes.push({
      rol: 'usuario',
      contenido: texto,
      tuvoImagen: !!this.archivoSeleccionado,
      _previewLocal: this.previewImagenSeleccionada
    });

    const archivo = this.archivoSeleccionado;
    this.textoInput = '';
    this.archivoSeleccionado = null;
    this.previewImagenSeleccionada = null;
    this.enviandoMensaje = true;
    this.cdr.detectChanges();

    this.nutricionService.enviarMensajeChat(texto, archivo).subscribe({
      next: (data) => {
        if (data.exito) {
          this.mensajes.push(data.mensaje);
        } else {
          this.mostrarAlerta('danger', data.mensaje || 'No se pudo enviar el mensaje.');
        }
        this.enviandoMensaje = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'Error al conectar con el asistente.';
        this.mostrarAlerta('danger', mensajeError);
        this.enviandoMensaje = false;
        this.cdr.detectChanges();
      }
    });
  }

  onEnterInput(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  toggleChat() {
    this.mostrarChat = !this.mostrarChat;
    if (this.mostrarChat) {
      setTimeout(() => this.scrollAlFinal(), 100);
    }
  }
}