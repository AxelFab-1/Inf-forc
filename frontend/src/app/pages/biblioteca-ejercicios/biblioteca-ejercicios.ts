import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from "../../shared/header/header";

import { EntrenamientoService } from '../../services/entrenamiento';

@Component({
  selector: 'app-biblioteca-ejercicios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Header],
  templateUrl: './biblioteca-ejercicios.html',
  styleUrl: './biblioteca-ejercicios.css'
})
export class BibliotecaEjercicios implements OnInit {
  ejercicios: any[] = [];
  ejerciciosFiltrados: any[] = [];
  cargando: boolean = true;
  filtroActual: string = 'todos';
  terminoBusqueda: string = '';

  categorias: string[] = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio'];

  constructor(
    private entrenamientoService: EntrenamientoService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarEjercicios();
  }

  cargarEjercicios() {
    this.cargando = true;
    this.entrenamientoService.getEjercicios().subscribe({
      next: (data) => {
        if (data.exito) {
          this.ejercicios = data.datos;
          this.ejerciciosFiltrados = this.ejercicios;
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros() {
    let filtrados = this.ejercicios;

    if (this.filtroActual !== 'todos') {
      filtrados = filtrados.filter(e => e.grupoMuscular?.toLowerCase() === this.filtroActual.toLowerCase());
    }

    if (this.terminoBusqueda.trim()) {
      const q = this.terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(e => e.nombre.toLowerCase().includes(q));
    }

    this.ejerciciosFiltrados = filtrados;
  }

  filtrarPorCategoria(cat: string) {
    if (this.filtroActual === cat) {
      this.filtroActual = 'todos';
    } else {
      this.filtroActual = cat;
    }
    this.aplicarFiltros();
  }

  volverAEntrenar() {
    this.router.navigate(['/entrenar']);
  }
}
