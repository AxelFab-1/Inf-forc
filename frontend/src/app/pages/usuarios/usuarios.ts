import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { obtenerCabeceras } from '../../shared/utils/auth-headers';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {

  // ─── Listado de usuarios ────────────────────────────────────
  usuarios: any[] = [];
  cargandoUsuarios: boolean = true;

  // ─── Panel lateral: modo CREATE o EDIT ──────────────────────
  modo: 'crear' | 'editar' = 'crear';
  usuarioSeleccionado: any = null;

  // Formulario CREAR: todos los campos
  nuevoUsuario = {
    nombres: '', apellidos: '', dni: '',
    codigoAcceso: '', contrasena: '', sede: '', rol: 'cliente',
  };

  // Formulario EDITAR: SOLO nombres y apellidos (regla estricta)
  usuarioEditando = {
    _id: '', nombres: '', apellidos: '',
    // Solo para mostrar como bloqueados
    dni: '', codigoAcceso: '', sede: '', rol: '',
  };

  // ─── Alertas ─────────────────────────────────────────────────
  alerta: { tipo: 'success' | 'danger'; mensaje: string } | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  // ─── Carga de usuarios ───────────────────────────────────────
  cargarUsuarios() {
    this.cargandoUsuarios = true;
    fetch('http://localhost:8090/api/usuarios', { headers: obtenerCabeceras() })
      .then(res => res.json())
      .then(data => {
        if (data.exito) {
          this.usuarios = data.datos;
        }
        this.cargandoUsuarios = false;
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.cargandoUsuarios = false;
        this.mostrarAlerta('danger', 'Error al cargar usuarios.');
      });
  }

  // ─── Selección para editar ───────────────────────────────────
  seleccionarUsuario(usuario: any) {
    this.modo = 'editar';
    this.usuarioSeleccionado = usuario;
    this.usuarioEditando = {
      _id:          usuario._id,
      nombres:      usuario.nombres,
      apellidos:    usuario.apellidos,
      dni:          usuario.dni,
      codigoAcceso: usuario.codigoAcceso,
      sede:         usuario.sede,
      rol:          usuario.rol,
    };
    this.alerta = null;
    this.cdr.detectChanges();
  }

  limpiarPanel() {
    this.modo = 'crear';
    this.usuarioSeleccionado = null;
    this.nuevoUsuario = { nombres: '', apellidos: '', dni: '', codigoAcceso: '', contrasena: '', sede: '', rol: 'cliente' };
    this.alerta = null;
    this.cdr.detectChanges();
  }

  // ─── POST: Registrar nuevo usuario ───────────────────────────
  registrarUsuario(formulario: any) {
    if (formulario.invalid) {
      this.mostrarAlerta('danger', 'Por favor, completa todos los campos correctamente.');
      return;
    }

    fetch('http://localhost:8090/api/usuarios', {
      method: 'POST',
      headers: obtenerCabeceras(),
      body: JSON.stringify(this.nuevoUsuario),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.mensaje || 'Error de validación en el servidor.');
        }
        return res.json();
      })
      .then(data => {
        if (data.exito) {
          this.mostrarAlerta('success', data.mensaje || 'Usuario registrado.');
          formulario.resetForm({ rol: 'cliente', sede: '' });
          this.cargarUsuarios();
        } else {
          this.mostrarAlerta('danger', data.mensaje);
        }
      })
      .catch(err => this.mostrarAlerta('danger', err.message));
  }

  // ─── PUT: Editar solo nombres y apellidos ────────────────────
  guardarEdicion(formulario: any) {
    if (formulario.invalid) {
      this.mostrarAlerta('danger', 'Completa los campos requeridos.');
      return;
    }

    const payload = {
      nombres:   this.usuarioEditando.nombres,
      apellidos: this.usuarioEditando.apellidos,
    };

    fetch(`http://localhost:8090/api/usuarios/${this.usuarioEditando._id}`, {
      method: 'PUT',
      headers: obtenerCabeceras(),
      body: JSON.stringify(payload),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.mensaje || 'No se pudo actualizar el usuario.');
        }
        return res.json();
      })
      .then(data => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Usuario actualizado correctamente.');
          this.cargarUsuarios();
          this.limpiarPanel();
        }
      })
      .catch(err => this.mostrarAlerta('danger', err.message));
  }

  // ─── Helper sincronizar contraseña con DNI ───────────────────
  sincronizarContrasena() {
    this.nuevoUsuario.contrasena = this.nuevoUsuario.dni;
  }

  // ─── Helper alertas ─────────────────────────────────────────
  mostrarAlerta(tipo: 'success' | 'danger', mensaje: string) {
    this.alerta = { tipo, mensaje };
    this.cdr.detectChanges();
    if (tipo === 'success') {
      setTimeout(() => { this.alerta = null; this.cdr.detectChanges(); }, 3500);
    }
  }

  cerrarAlerta() { this.alerta = null; }
}
