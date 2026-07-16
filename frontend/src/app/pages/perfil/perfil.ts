import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from "../../shared/header/header";
import { FooterMenu } from "../../shared/footer-menu/footer-menu";
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, FooterMenu, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  usuario: any = null;
  cargando: boolean = true;
  subiendoFoto: boolean = false;
  errorMensaje: string = '';
  exitoMensaje: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.cargando = true;
    this.authService.getMiPerfil().subscribe({
      next: (data) => {
        if (data.exito) {
          this.usuario = data.datos;
          this.errorMensaje = '';
        } else {
          this.errorMensaje = data.mensaje || 'Error al cargar perfil.';
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMensaje = 'No se pudo conectar con el servidor.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get ultimoRegistro() {
    if (this.usuario?.historialBiometrico && this.usuario.historialBiometrico.length > 0) {
      return this.usuario.historialBiometrico[this.usuario.historialBiometrico.length - 1];
    }
    return null;
  }

  get avatarUrl() {
    if (this.usuario?.perfilImagenUrl) {
      return this.usuario.perfilImagenUrl;
    }
    const name = this.usuario?.nombres || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ffd700&color=000&size=150`;
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.subirAvatar(file);
    }
  }

  subirAvatar(file: File) {
    this.subiendoFoto = true;
    this.errorMensaje = '';
    this.exitoMensaje = '';
    this.cdr.detectChanges();

    this.authService.subirAvatar(file).subscribe({
      next: (data) => {
        if (data.exito) {
          this.usuario.perfilImagenUrl = data.perfilImagenUrl;
          this.exitoMensaje = '¡Foto actualizada!';
          setTimeout(() => this.exitoMensaje = '', 3000);
        } else {
          this.errorMensaje = data.mensaje || 'Error al subir la imagen.';
        }
        this.subiendoFoto = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMensaje = 'Fallo la conexión al subir la imagen.';
        this.subiendoFoto = false;
        this.cdr.detectChanges();
      }
    });
  }
}
