import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { decodificarToken } from '../../shared/utils/jwt-decoder';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  codigo: string = '';
  contrasena: string = '';
  mensajeError: string = '';
  mostrarPassword: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

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

  hacerLogin() {
    this.mensajeError = '';

    if (!this.codigo || !this.contrasena) {
      this.mensajeError = 'Por favor, completa ambos campos.';
      return;
    }

    const body = {
      codigo: this.codigo,
      contrasena: this.contrasena,
    };

    this.http.post<any>('http://localhost:8090/api/login', body).subscribe({
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
          this.contrasena = '';
          this.cdr.detectChanges(); 
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.mensajeError = 'Código de acceso o contraseña incorrectos.';
        } else {
          this.mensajeError = 'Error de conexión con el servidor.';
        }
        this.contrasena = '';
        this.cdr.detectChanges();
        console.error('Error:', err);
      },
    });
  }
}
