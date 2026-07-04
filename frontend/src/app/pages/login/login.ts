import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { decodificarToken } from '../../shared/utils/jwt-decoder';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm: FormGroup;

  mensajeError: string = '';
  mostrarPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    this.loginForm = this.fb.group({
      codigo: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.minLength(5),
          Validators.maxLength(5),
        ],
      ],
      contrasena: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const token = localStorage.getItem('jwt_token');

    if (token) {
      const datosUsuario = decodificarToken(token);
      const rolUsuario = datosUsuario?.rol || 'cliente';

      if (rolUsuario === 'administrador') {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  limpiarCodigoLetras(event: any) {
    const valorLimpio = event.target.value.replace(/[^0-9]/g, '');
    this.loginForm.get('codigo')?.setValue(valorLimpio, { emitEvent: false });
  }

  hacerLogin() {
    this.mensajeError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const body = {
      codigo: this.loginForm.value.codigo,
      contrasena: this.loginForm.value.contrasena,
    };

    this.authService.login(body).subscribe({
      next: (data) => {
        if (data.exito && data.token) {
          localStorage.setItem('jwt_token', data.token);

          const datosUsuario = decodificarToken(data.token);
          const rolUsuario = datosUsuario?.rol || 'cliente';

          if (rolUsuario === 'administrador') {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.mensajeError = data.mensaje || 'Error al iniciar sesión';
          this.loginForm.get('contrasena')?.setValue('');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.mensajeError = err.error?.mensaje || 'Error de conexión con el servidor.';
        this.loginForm.get('contrasena')?.setValue('');
        this.cdr.detectChanges();
        console.error('Error:', err);
      },
    });
  }
}
