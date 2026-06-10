import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { obtenerCabeceras } from '../../shared/utils/auth-headers';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class Inventario implements OnInit {

  // ─── Listado y filtros ───────────────────────────────────────
  productos: any[] = [];
  productosFiltrados: any[] = [];
  textoBusqueda: string = '';
  filtroCategoria: string = '';
  readonly categorias = ['suplementos', 'ropa', 'accesorios'];

  // ─── Panel lateral: modo CREATE o EDIT ───────────────────────
  modo: 'crear' | 'editar' = 'crear';
  productoSeleccionado: any = null;

  nuevoProducto = {
    nombre: '', categoria: '', precio: null as number | null,
    stock: 10, imagenUrl: '', activo: true,
  };

  productoEditando = {
    _id: '', nombre: '', categoria: '',
    precio: null as number | null, imagenUrl: '', activo: true,
  };

  // ─── Alertas ─────────────────────────────────────────────────
  alerta: { tipo: 'success' | 'danger'; mensaje: string } | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarProductos();
  }

  // ─── Carga y filtrado ────────────────────────────────────────
  cargarProductos() {
    fetch('http://localhost:8090/api/productos', { headers: obtenerCabeceras() })
      .then(res => res.json())
      .then(data => {
        if (data.exito) {
          this.productos = data.datos;
          this.aplicarFiltros();
          this.cdr.detectChanges();
        }
      })
      .catch(() => this.mostrarAlerta('danger', 'Error al conectar con el servidor.'));
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

  // ─── Panel lateral: seleccionar para editar ───────────────────
  seleccionarProducto(prod: any) {
    this.modo = 'editar';
    this.productoSeleccionado = prod;
    this.productoEditando = {
      _id:       prod._id,
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

  // ─── CRUD: Crear ─────────────────────────────────────────────
  crearProducto(formulario: any) {
    if (formulario.invalid) {
      this.mostrarAlerta('danger', 'Completa todos los campos del producto.');
      return;
    }

    fetch('http://localhost:8090/api/productos', {
      method: 'POST',
      headers: obtenerCabeceras(),
      body: JSON.stringify(this.nuevoProducto),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.mensaje || 'Error en los datos del producto.');
        }
        return res.json();
      })
      .then(data => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Producto agregado al catálogo.');
          formulario.resetForm({ stock: 10, activo: true });
          this.cargarProductos();
        }
      })
      .catch(err => this.mostrarAlerta('danger', err.message));
  }

  // ─── CRUD: Editar (PUT) ───────────────────────────────────────
  guardarEdicion(formulario: any) {
    if (formulario.invalid) {
      this.mostrarAlerta('danger', 'Completa todos los campos.');
      return;
    }

    fetch(`http://localhost:8090/api/productos/${this.productoEditando._id}`, {
      method: 'PUT',
      headers: obtenerCabeceras(),
      body: JSON.stringify(this.productoEditando),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.mensaje || 'No se pudo actualizar el producto.');
        }
        return res.json();
      })
      .then(data => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Producto actualizado correctamente.');
          this.cargarProductos();
          this.limpiarPanel();
        }
      })
      .catch(err => this.mostrarAlerta('danger', err.message));
  }

  // ─── CRUD: Eliminar (DELETE con confirm) ──────────────────────
  eliminarProducto(prod: any) {
    const confirmado = confirm(
      `¿Estás seguro de que deseas eliminar "${prod.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    fetch(`http://localhost:8090/api/productos/${prod._id}`, {
      method: 'DELETE',
      headers: obtenerCabeceras(),
    })
      .then(async res => {
        if (!res.ok) throw new Error('No se pudo eliminar el producto.');
        return res.json();
      })
      .then(data => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Producto eliminado.');
          this.cargarProductos();
          if (this.productoSeleccionado?._id === prod._id) this.limpiarPanel();
        }
      })
      .catch(err => this.mostrarAlerta('danger', err.message));
  }

  // ─── Borrado lógico (toggle disponibilidad) ───────────────────
  toggleDisponibilidad(prod: any) {
    const actualizado = { ...prod, activo: !prod.activo };
    fetch(`http://localhost:8090/api/productos/${prod._id}`, {
      method: 'PUT',
      headers: obtenerCabeceras(),
      body: JSON.stringify(actualizado),
    })
      .then(res => res.json())
      .then(data => {
        if (data.exito) {
          prod.activo = !prod.activo;
          this.cdr.detectChanges();
        }
      })
      .catch(() => this.mostrarAlerta('danger', 'No se pudo cambiar el estado.'));
  }

  // ─── Helper alertas ──────────────────────────────────────────
  mostrarAlerta(tipo: 'success' | 'danger', mensaje: string) {
    this.alerta = { tipo, mensaje };
    this.cdr.detectChanges();
    if (tipo === 'success') {
      setTimeout(() => { this.alerta = null; this.cdr.detectChanges(); }, 3000);
    }
  }

  cerrarAlerta() { this.alerta = null; }
}
