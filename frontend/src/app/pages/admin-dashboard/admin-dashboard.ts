import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { obtenerCabeceras } from '../../shared/utils/auth-headers';
import { decodificarToken } from '../../shared/utils/jwt-decoder';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  nombreAdmin: string = '';
  tabActiva: string = 'usuarios'; // Controla qué pestaña se ve

  // --- VARIABLES DE USUARIO ---
  nuevoUsuario = {
    nombres: '', apellidos: '', dni: '', codigoAcceso: '', contrasena: '', sede: '', rol: 'cliente',
  };

  // --- VARIABLES DE PRODUCTOS ---
  productos: any[] = [];
  nuevoProducto = {
    nombre: '', categoria: '', precio: null, stock: 10, imagenUrl: '', activo: true
  };

  alerta: { tipo: 'success' | 'danger'; mensaje: string } | null = null;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const datosUsuario = decodificarToken(token);
      if (datosUsuario) {
        if (datosUsuario.rol !== 'administrador') {
          alert('Acceso denegado. Área exclusiva para administradores.');
          this.router.navigate(['/']);
          return;
        }
        this.nombreAdmin = datosUsuario.nombres || '';
      }
    }
    this.cargarProductos(); // Cargamos el inventario al entrar
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  cambiarTab(tab: string) {
    this.tabActiva = tab;
    this.alerta = null; // Limpiamos alertas al cambiar de pestaña
  }

  cerrarAlerta() {
    this.alerta = null;
  }

  // --- LÓGICA DE USUARIOS ---
  sincronizarContrasena() {
    this.nuevoUsuario.contrasena = this.nuevoUsuario.dni;
  }

 registrarUsuario(formulario: any) {
    if (formulario.invalid) {
      this.alerta = { tipo: 'danger', mensaje: 'Por favor, completa todos los campos correctamente.' };
      return;
    }

    fetch('http://localhost:8090/api/usuarios', {
      method: 'POST',
      headers: obtenerCabeceras(),
      body: JSON.stringify(this.nuevoUsuario),
    })
      .then(async (response) => {
        if (!response.ok) {
          // AHORA SÍ LEEMOS EL MENSAJE REAL DEL BACKEND
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.mensaje || 'Error de validación en el servidor.');
        }
        return response.json();
      })
      .then((data) => {
        if (data.exito) {
          this.alerta = { tipo: 'success', mensaje: data.mensaje };
          formulario.resetForm({ rol: 'cliente', sede: '' });
        } else {
          this.alerta = { tipo: 'danger', mensaje: data.mensaje };
        }
        this.cdr.detectChanges();
      })
      .catch((error) => {
        this.alerta = { tipo: 'danger', mensaje: error.message };
        this.cdr.detectChanges();
      });
  }

  // --- LÓGICA DE PRODUCTOS ---
  cargarProductos() {
    fetch('http://localhost:8090/api/productos', { headers: obtenerCabeceras() })
      .then(res => res.json())
      .then(data => {
        if (data.exito) {
          this.productos = data.datos;
          this.cdr.detectChanges();
        }
      });
  }

  crearProducto(formularioProd: any) {
    if (formularioProd.invalid) {
      this.alerta = { tipo: 'danger', mensaje: 'Completa los datos del producto.' };
      return;
    }

    fetch('http://localhost:8090/api/productos', {
      method: 'POST',
      headers: obtenerCabeceras(),
      body: JSON.stringify(this.nuevoProducto),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.mensaje || 'Error en los datos del producto.');
        }
        return response.json();
      })
      .then((data) => {
        if (data.exito) {
          this.alerta = { tipo: 'success', mensaje: 'Producto agregado al catálogo.' };
          this.cargarProductos(); // Recargamos la lista
          formularioProd.resetForm({ stock: 10, activo: true });
        }
        this.cdr.detectChanges();
      })
      .catch((error) => {
        this.alerta = { tipo: 'danger', mensaje: error.message };
        this.cdr.detectChanges();
      });
  }

  actualizarProducto(prod: any) {
    fetch(`http://localhost:8090/api/productos/${prod._id}`, {
      method: 'PUT',
      headers: obtenerCabeceras(),
      body: JSON.stringify(prod),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('No se pudo actualizar el producto.');
        return response.json();
      })
      .then((data) => {
        if (data.exito) {
          this.alerta = { tipo: 'success', mensaje: 'Inventario actualizado.' };
          this.cdr.detectChanges();
          setTimeout(() => this.cerrarAlerta(), 2000);
        }
      })
      .catch((error) => {
        this.alerta = { tipo: 'danger', mensaje: error.message };
        this.cdr.detectChanges();
      });
  }

  toggleDisponibilidad(prod: any) {
    prod.activo = !prod.activo; // Invertimos el estado (Soft Delete)
    this.actualizarProducto(prod); // Guardamos en la BD
  }
}
