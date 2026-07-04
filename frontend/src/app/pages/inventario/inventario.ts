import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule], 
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
  productoEditandoId: string = ''; 

  registroForm: FormGroup;
  editarForm: FormGroup;

  alerta: { tipo: 'success' | 'danger'; mensaje: string } | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private adminService: AdminService,
    private fb: FormBuilder 
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      categoria: ['', [Validators.required]],
      precio: [null, [Validators.required, Validators.min(0)]],
      stock: [10, [Validators.min(0)]], // Stock por defecto es 10
      imagenUrl: ['', [Validators.required, Validators.maxLength(255)]],
      activo: [true] 
    });

    this.editarForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      categoria: ['', [Validators.required]],
      precio: [null, [Validators.required, Validators.min(0)]],
      imagenUrl: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

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
    this.productoEditandoId = prod.id || prod._id; 

    this.editarForm.patchValue({
      nombre: prod.nombre,
      categoria: prod.categoria,
      precio: prod.precio,
      imagenUrl: prod.imagenUrl
    });

    this.alerta = null;
    this.cdr.detectChanges();
  }

  limpiarPanel() {
    this.modo = 'crear';
    this.productoSeleccionado = null;
    this.productoEditandoId = '';
    this.registroForm.reset({ stock: 10, activo: true });
    this.alerta = null;
    this.cdr.detectChanges();
  }

  crearProducto() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      this.mostrarAlerta('danger', 'Completa todos los campos correctamente.');
      return;
    }

    const payload = this.registroForm.value;

    this.adminService.crearProducto(payload).subscribe({
      next: (data) => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Producto agregado al catálogo.');
          this.registroForm.reset({ stock: 10, activo: true });
          this.cargarProductos();
        }
      },
      error: (err) => {
        const mensajeError = err.error?.mensaje || 'Error al guardar el producto.';
        this.mostrarAlerta('danger', mensajeError);
      }
    });
  }

  guardarEdicion() {
    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();
      this.mostrarAlerta('danger', 'Completa todos los campos.');
      return;
    }

    const payload = this.editarForm.value;

    this.adminService.actualizarProducto(this.productoEditandoId, payload).subscribe({
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

  eliminarProducto() {
    if (!this.productoSeleccionado) return;
    
    const idEliminar = this.productoEditandoId; 
    const confirmado = confirm(`¿Estás seguro de eliminar "${this.productoSeleccionado.nombre}"?`);
    if (!confirmado) return;

    this.adminService.eliminarProducto(idEliminar).subscribe({
      next: (data) => {
        if (data.exito) {
          this.mostrarAlerta('success', 'Producto eliminado.');
          this.cargarProductos();
          if (this.productoSeleccionado?.id === idEliminar || this.productoSeleccionado?._id === idEliminar) {
            this.limpiarPanel();
          }
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