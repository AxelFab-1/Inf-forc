import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { decodificarToken } from '../utils/jwt-decoder';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  codigoSocio: string = '00000';
  avatarUrl: string = '';
  menuAbierto: boolean = false;
  mostrarModalCambioClave: boolean = false;

  cambioClaveForm: FormGroup;

  mensajeModal: { tipo: 'success' | 'danger'; texto: string } | null = null;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder 
  ) {
    this.cambioClaveForm = this.fb.group({
      claveActual: ['', [Validators.required]],
      nuevaClave: ['', [Validators.required, Validators.minLength(8)]],
      confirmarNuevaClave: ['', [Validators.required]]
    }, { validators: this.passwordsCoinciden }); 
  }

  ngOnInit() {
    let nombreSocio = 'Socio';
    const token = localStorage.getItem('jwt_token');

    if (token) {
      const datosUsuario = decodificarToken(token);
      if (datosUsuario) {
        nombreSocio = datosUsuario.nombres || nombreSocio;
        this.codigoSocio = datosUsuario.codigo || this.codigoSocio;
      }
    }
    this.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreSocio)}&background=ffd700&color=000`;
  }

  passwordsCoinciden(group: AbstractControl): ValidationErrors | null {
    const nuevaClave = group.get('nuevaClave')?.value;
    const confirmarNuevaClave = group.get('confirmarNuevaClave')?.value;
    
    if (nuevaClave && confirmarNuevaClave && nuevaClave !== confirmarNuevaClave) {
      return { mismatch: true };
    }
    return null; 
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  abrirModalCambioClave() {
    this.menuAbierto = false;
    this.mostrarModalCambioClave = true;
    this.cambioClaveForm.reset(); 
    this.mensajeModal = null;
  }

  cerrarModalCambioClave() {
    this.mostrarModalCambioClave = false;
    this.mensajeModal = null;
  }

  guardarNuevaClave() {
    this.mensajeModal = null;

    if (this.cambioClaveForm.invalid) {
      this.cambioClaveForm.markAllAsTouched();
      return;
    }

    const payload = this.cambioClaveForm.value;

    this.authService.cambiarPassword(payload).subscribe({
      next: (data: any) => {
        if (data.exito) {
          this.mensajeModal = { tipo: 'success', texto: data.mensaje };
          this.cambioClaveForm.reset(); 
          this.cdr.detectChanges();
          
          setTimeout(() => {
            this.cerrarModalCambioClave();
            this.cdr.detectChanges();
          }, 2000);
        } else {
          this.mensajeModal = { tipo: 'danger', texto: data.mensaje };
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        const errorMsg = err.error?.mensaje || 'Error al actualizar la contraseña.';
        this.mensajeModal = { tipo: 'danger', texto: errorMsg };
        this.cdr.detectChanges();
      }
    });
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
