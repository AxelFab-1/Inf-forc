import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {

  usuarios: any[] = [];
  cargandoUsuarios: boolean = true;

  modo: 'crear' | 'editar' = 'crear';
  usuarioSeleccionado: any = null;
  usuarioEditandoId: string = ''; 

  registroForm: FormGroup;
  editarForm: FormGroup;

  alerta: { tipo: 'success' | 'danger'; mensaje: string } | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private adminService: AdminService,
    private fb: FormBuilder 
  ) {
    this.registroForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.maxLength(50)]],
      dni: ['', [Validators.required, Validators.maxLength(8), Validators.pattern('^[0-9]+$')]],
      codigoAcceso: ['', [Validators.required, Validators.maxLength(5), Validators.pattern('^[0-9]+$')]],
      contrasena: ['', [Validators.required, Validators.maxLength(64)]],
      sede: ['', [Validators.required]],
      rol: ['cliente', [Validators.required]] 
    });

    this.editarForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.maxLength(50)]],
      dni: [{ value: '', disabled: true }], 
      codigoAcceso: [{ value: '', disabled: true }],
      sede: [{ value: '', disabled: true }],
      rol: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
  }

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

  seleccionarUsuario(usuario: any) {
    this.modo = 'editar';
    this.usuarioSeleccionado = usuario;
    this.usuarioEditandoId = usuario.id || usuario._id; 

    this.editarForm.patchValue({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      dni: usuario.dni,
      codigoAcceso: usuario.codigoAcceso,
      sede: usuario.sede,
      rol: usuario.rol
    });

    this.alerta = null;
    this.cdr.detectChanges();
  }

  limpiarPanel() {
    this.modo = 'crear';
    this.usuarioSeleccionado = null;
    this.usuarioEditandoId = '';
    this.registroForm.reset({ rol: 'cliente', sede: '' });
    this.alerta = null;
    this.cdr.detectChanges();
  }

  registrarUsuario() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched(); 
      this.mostrarAlerta('danger', 'Por favor, completa todos los campos correctamente.');
      return;
    }

    const payload = this.registroForm.value;

    this.adminService.registrarUsuario(payload).subscribe({
      next: (data) => {
        if (data.exito) {
          this.mostrarAlerta('success', data.mensaje || 'Usuario registrado.');
          this.registroForm.reset({ rol: 'cliente', sede: '' });
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

  guardarEdicion() {
    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();
      this.mostrarAlerta('danger', 'Completa los campos requeridos.');
      return;
    }

    const payload = {
      nombres: this.editarForm.get('nombres')?.value,
      apellidos: this.editarForm.get('apellidos')?.value,
    };

    this.adminService.actualizarUsuario(this.usuarioEditandoId, payload).subscribe({
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

  sincronizarContrasena() {
    const dniActual = this.registroForm.get('dni')?.value;
    if (dniActual !== null && dniActual !== undefined) {
      this.registroForm.get('contrasena')?.setValue(dniActual);
    }
  }

  mostrarAlerta(tipo: 'success' | 'danger', mensaje: string) {
    this.alerta = { tipo, mensaje };
    this.cdr.detectChanges();
    if (tipo === 'success') {
      setTimeout(() => { this.alerta = null; this.cdr.detectChanges(); }, 3500);
    }
  }

  cerrarAlerta() { this.alerta = null; }
}