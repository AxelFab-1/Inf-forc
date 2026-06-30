import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class Inventario implements OnInit {

  productos: any[] = [];
  productosFiltrados: any[] = [];
  textoBusqueda: string = '';
  filtroCategoria: string = '';
  readonly categorias = ['suplementos', 'ropa', 'accesorios'];

  modo: 'crear' | 'editar' = 'crear';
  productoSeleccionado: any = null;

  nuevoProducto = {
    nombre: '', categoria: '', precio: null as number | null,
    stock: 10, imagenUrl: '', activo: true,
  };

  productoEditando = {
    id: '', // 👇 CAMBIO: Usamos 'id' en lugar de '_id'
    nombre: '', categoria: '',
    precio: null as number | null, imagenUrl: '', activo: true,
  };

  alerta: { tipo: 'success' | 'danger'; mensaje: string } | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.adminService.getProductos().subscribe({
      next: (data) => {
        if (data.exito) {
          this.productos = data.datos;
          this.aplicarFiltros();
          this.cdr.detectChanges();
        }
      },
      error: () => this.mostrarAlerta('danger', 'Error al conectar con el servidor.')
    });
  }

  aplicarFiltros() {
    let resultado = [...this.productos];
    if (this.textoBusqueda.trim()) {
      const texto = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(p => p.nombre?.toLowerCase().includes(texto));
    }
    if (this.filtroCategoria) {
      resultado = resultado.filter(p => p.categoria === this.filtroCategoria);
    }
    this.productosFiltrados = resultado;
    this.cdr.detectChanges();
  }

  limpiarFiltros() {
    this.textoBusqueda = '';
    this.filtroCategoria = '';
    this.aplicarFiltros();
  }

  seleccionarProducto(prod: any) {
    this.modo = 'editar';
    this.productoSeleccionado = prod;
    // 👇 CAMBIO: Soporte para ambos formatos de ID
    this.productoEditando = {
      id:        prod.id || prod._id, 
      nombre:    prod.nombre,
      categoria: prod.categoria,
      precio:    prod.precio,
      imagenUrl: prod.imagenUrl,
      activo:    prod.activo,
    };
    this.alerta = null;
    this.cdr.detectChanges();
  }

  limpiarPanel() {
    this.modo = 'crear';
    this.productoSeleccionado = null;
    this.nuevoProducto = { nombre: '', categoria: '', precio: null, stock: 10, imagenUrl: '', activo: true };
    this.alerta = null;
    this.cdr.detectChanges();
  }

  crearProducto(formulario: any) {
    if (formulario.invalid) {
      this.mostrarAlerta('danger', 'Completa todos los campos correctamente.');
      return;
    }

    this.adminService.crearProducto(this.nuevoProducto).subscribe({
      next: (data) => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Producto agregado al catálogo.');
          formulario.resetForm({ stock: 10, activo: true });
          this.cargarProductos();
        }
      },
      error: (err) => {
        // 👇 AQUÍ ESTÁ EL CATCH DE ERRORES DEL BACKEND
        const mensajeError = err.error?.mensaje || 'Error al guardar el producto.';
        this.mostrarAlerta('danger', mensajeError);
      }
    });
  }

  guardarEdicion(formulario: any) {
    if (formulario.invalid) {
      this.mostrarAlerta('danger', 'Completa todos los campos.');
      return;
    }

    // 👇 CAMBIO: Usamos this.productoEditando.id
    this.adminService.actualizarProducto(this.productoEditando.id, this.productoEditando).subscribe({
      next: (data) => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Producto actualizado correctamente.');
          this.cargarProductos();
          this.limpiarPanel();
        }
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'No se pudo actualizar el producto.';
        this.mostrarAlerta('danger', mensajeError);
      }
    });
  }

  eliminarProducto(prod: any) {
    const idEliminar = prod.id || prod._id; // Soporte para ID
    const confirmado = confirm(`¿Estás seguro de eliminar "${prod.nombre}"?`);
    if (!confirmado) return;

    this.adminService.eliminarProducto(idEliminar).subscribe({
      next: (data) => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Producto eliminado.');
          this.cargarProductos();
          if (this.productoSeleccionado?.id === idEliminar) this.limpiarPanel();
        }
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'No se pudo eliminar.';
        this.mostrarAlerta('danger', mensajeError);
      }
    });
  }

  toggleDisponibilidad(prod: any) {
    const idActualizar = prod.id || prod._id;
    const actualizado = { ...prod, activo: !prod.activo };
    
    this.adminService.actualizarProducto(idActualizar, actualizado).subscribe({
      next: (data) => {
        if (data.exito) {
          prod.activo = !prod.activo;
          this.cdr.detectChanges();
        }
      },
      error: () => this.mostrarAlerta('danger', 'No se pudo cambiar el estado.')
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