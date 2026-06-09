import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../shared/header/header';
import { FooterMenu } from '../../shared/footer-menu/footer-menu';
import { obtenerCabeceras } from '../../shared/utils/auth-headers';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, Header, FooterMenu],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnInit {
  productosData: any[] = [];
  productosFiltrados: any[] = [];
  categoriaActiva: string = 'todos';
  errorMensaje: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    fetch('http://localhost:8090/api/productos', {
      headers: obtenerCabeceras(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.exito) {
          this.productosData = data.datos;
          this.productosFiltrados = [...this.productosData];

          this.cdr.detectChanges();
        } else {
          this.errorMensaje = data.mensaje || 'Error al cargar productos';
          this.cdr.detectChanges();
        }
      })
      .catch((err) => {
        console.error('Error de conexión:', err);
        this.errorMensaje = 'No se pudo cargar el catálogo. Verifica que el servidor esté activo.';
        this.cdr.detectChanges();
      });
  }

  filtrar(categoria: string) {
    this.categoriaActiva = categoria;

    if (categoria === 'todos') {
      this.productosFiltrados = [...this.productosData];
    } else {
      this.productosFiltrados = this.productosData.filter((p) => p.categoria === categoria);
    }
  }

  manejarErrorImagen(event: any) {
    event.target.src = 'https://placehold.co/300x140?text=Sin+Imagen';
  }
}
