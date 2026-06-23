import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { obtenerCabeceras } from '../../shared/utils/auth-headers';
import { API_URL } from '../../shared/utils/api-config';


@Component({
  selector: 'app-nutricion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nutricion.html',
  styleUrl: './nutricion.css',
})
export class Nutricion implements OnInit {

  // ─── Estado de carga ──────────────────────────────────────────
  cargando: boolean = true;

  // ─── Modales ──────────────────────────────────────────────────
  mostrarModalPrimeraVez: boolean = false;
  mostrarModalActualizar: boolean = false;

  // ─── Datos del usuario y último registro ──────────────────────
  tienePerfil: boolean = false;
  ultimoRegistro: any = null;

  // ─── Formulario Primera Evaluación ───────────────────────────
  primeraEvaluacion = {
    sexo: '',
    fechaNacimiento: '',
    estaturaCm: null as number | null,
    pesoKg: null as number | null,
    nivelActividad: '',
    objetivo: '',
  };

  // ─── Formulario Actualización ─────────────────────────────────
  actualizacion = {
    pesoKg: null as number | null,
    nivelActividad: '',
    objetivo: '',
  };

  // ─── Alertas ─────────────────────────────────────────────────
  alerta: { tipo: 'success' | 'danger'; mensaje: string } | null = null;
  alertaModal: { tipo: 'success' | 'danger'; mensaje: string } | null = null;
  guardando: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarPerfil();
  }

  // ─── Cargar perfil desde el backend ──────────────────────────
  cargarPerfil() {
    this.cargando = true;
    fetch(`${API_URL}/api/nutricion/perfil`, {
      headers: obtenerCabeceras(),
    })
      .then(res => res.json())
      .then(data => {
        if (data.exito) {
          const tieneDatosEstaticos = data.estaturaCm && data.fechaNacimiento;
          this.tienePerfil = !!tieneDatosEstaticos;
          this.ultimoRegistro = data.ultimoRegistro || null;

          if (!this.tienePerfil) {
            // Primera vez: abrir modal de evaluación inicial
            this.mostrarModalPrimeraVez = true;
          }
        } else {
          this.mostrarAlerta('danger', data.mensaje || 'Error al cargar el perfil.');
        }
        this.cargando = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.mostrarAlerta('danger', 'Error de conexión con el servidor.');
        this.cargando = false;
        this.cdr.detectChanges();
      });
  }

  // ─── Guardar primera evaluación ───────────────────────────────
  guardarPrimeraEvaluacion(formulario: any) {
    if (formulario.invalid) {
      this.alertaModal = { tipo: 'danger', mensaje: 'Completa todos los campos.' };
      return;
    }
    this.guardando = true;
    this.alertaModal = null;

    fetch(`${API_URL}/api/nutricion/registrar`, {
      method: 'POST',
      headers: obtenerCabeceras(),
      body: JSON.stringify(this.primeraEvaluacion),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.mensaje || 'Error al guardar.');
        }
        return res.json();
      })
      .then(data => {
        if (data.exito) {
          this.ultimoRegistro = data.ultimoRegistro;
          this.tienePerfil = true;
          this.cerrarModalPrimeraVez();
          this.mostrarAlerta('success', '¡Perfil biométrico creado exitosamente!');
        }
        this.guardando = false;
        this.cdr.detectChanges();
      })
      .catch(err => {
        this.alertaModal = { tipo: 'danger', mensaje: err.message };
        this.guardando = false;
        this.cdr.detectChanges();
      });
  }

  // ─── Guardar actualización de datos ──────────────────────────
  guardarActualizacion(formulario: any) {
    if (formulario.invalid) {
      this.alertaModal = { tipo: 'danger', mensaje: 'Completa todos los campos.' };
      return;
    }
    this.guardando = true;
    this.alertaModal = null;

    fetch(`${API_URL}/api/nutricion/registrar`, {
      method: 'POST',
      headers: obtenerCabeceras(),
      body: JSON.stringify(this.actualizacion),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.mensaje || 'Error al actualizar.');
        }
        return res.json();
      })
      .then(data => {
        if (data.exito) {
          this.ultimoRegistro = data.ultimoRegistro;
          this.cerrarModalActualizar();
          this.mostrarAlerta('success', '¡Datos actualizados correctamente!');
        }
        this.guardando = false;
        this.cdr.detectChanges();
      })
      .catch(err => {
        this.alertaModal = { tipo: 'danger', mensaje: err.message };
        this.guardando = false;
        this.cdr.detectChanges();
      });
  }

  // ─── Modales ──────────────────────────────────────────────────
  abrirModalActualizar() {
    this.actualizacion = {
      pesoKg: this.ultimoRegistro?.pesoKg || null,
      nivelActividad: this.ultimoRegistro?.nivelActividad || '',
      objetivo: this.ultimoRegistro?.objetivo || '',
    };
    this.alertaModal = null;
    this.mostrarModalActualizar = true;
    this.cdr.detectChanges();
  }

  cerrarModalPrimeraVez() {
    this.mostrarModalPrimeraVez = false;
    this.alertaModal = null;
    this.cdr.detectChanges();
  }

  cerrarModalActualizar() {
    this.mostrarModalActualizar = false;
    this.alertaModal = null;
    this.cdr.detectChanges();
  }

  // ─── Helpers UI ──────────────────────────────────────────────
  categoriaIMC(imc: number): string {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25)   return 'Peso normal';
    if (imc < 30)   return 'Sobrepeso';
    return 'Obesidad';
  }

  colorIMC(imc: number): string {
    if (imc < 18.5) return '#5bc0de'; // azul
    if (imc < 25)   return '#5cb85c'; // verde
    if (imc < 30)   return '#f0ad4e'; // naranja
    return '#d9534f';                 // rojo
  }

  mostrarAlerta(tipo: 'success' | 'danger', mensaje: string) {
    this.alerta = { tipo, mensaje };
    this.cdr.detectChanges();
    if (tipo === 'success') {
      setTimeout(() => { this.alerta = null; this.cdr.detectChanges(); }, 4000);
    }
  }

  cerrarAlerta() { this.alerta = null; }
}
