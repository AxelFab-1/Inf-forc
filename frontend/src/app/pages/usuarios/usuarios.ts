import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';

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
    id: '', nombres: '', apellidos: '', // 👇 CAMBIO: Usamos 'id' en lugar de '_id'
    // Solo para mostrar como bloqueados
    dni: '', codigoAcceso: '', sede: '', rol: '',
  };

  // ─── Alertas ─────────────────────────────────────────────────
  alerta: { tipo: 'success' | 'danger'; mensaje: string } | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private adminService: AdminService 
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  // ─── Carga de usuarios ───────────────────────────────────────
  cargarUsuarios() {
    this.cargandoUsuarios = true;
    
    this.adminService.getUsuarios().subscribe({
      next: (data) => {
        if (data.exito) {
          this.usuarios = data.datos;
        }
        this.cargandoUsuarios = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoUsuarios = false;
        this.mostrarAlerta('danger', 'Error al cargar usuarios.');
      }
    });
  }

  // ─── Selección para editar ───────────────────────────────────
  seleccionarUsuario(usuario: any) {
    this.modo = 'editar';
    this.usuarioSeleccionado = usuario;
    this.usuarioEditando = {
      id:           usuario.id || usuario._id, // 👇 CAMBIO: Capturamos el ID correcto
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

    this.adminService.registrarUsuario(this.nuevoUsuario).subscribe({
      next: (data) => {
        if (data.exito) {
          this.mostrarAlerta('success', data.mensaje || 'Usuario registrado.');
          formulario.resetForm({ rol: 'cliente', sede: '' });
          this.cargarUsuarios();
        } else {
          this.mostrarAlerta('danger', data.mensaje);
        }
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'Error de validación en el servidor.';
        this.mostrarAlerta('danger', mensajeError);
      }
    });
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

    // 👇 CAMBIO: Enviamos el ID correctamente a la URL
    this.adminService.actualizarUsuario(this.usuarioEditando.id, payload).subscribe({
      next: (data) => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Usuario actualizado correctamente.');
          this.cargarUsuarios();
          this.limpiarPanel();
        }
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'No se pudo actualizar el usuario.';
        this.mostrarAlerta('danger', mensajeError);
      }
    });
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