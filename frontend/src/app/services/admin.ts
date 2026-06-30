import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// 👇 AQUÍ ESTÁ LA MAGIA: Las rutas correctas apuntando a shared/utils
import { API_URL } from '../shared/utils/api-config';
import { obtenerCabeceras } from '../shared/utils/auth-headers';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  // Helper para convertir tus cabeceras personalizadas al formato que exige Angular
  private getHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders(obtenerCabeceras()) };
  }

  // ─── GET: Obtener todos los usuarios ───────────────────────────
  getUsuarios(): Observable<any> {
    return this.http.get(`${API_URL}/api/usuarios`, this.getHeaders());
  }

  // ─── POST: Registrar nuevo usuario ─────────────────────────────
  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${API_URL}/api/usuarios`, usuario, this.getHeaders());
  }

  // ─── PUT: Actualizar usuario ───────────────────────────────────
  actualizarUsuario(id: string, datos: any): Observable<any> {
    return this.http.put(`${API_URL}/api/usuarios/${id}`, datos, this.getHeaders());
  }

// 👇 NUEVAS FUNCIONES PARA EL INVENTARIO 👇
  
  getProductos(): Observable<any> {
    return this.http.get(`${API_URL}/api/productos`, this.getHeaders());
  }

  crearProducto(producto: any): Observable<any> {
    return this.http.post(`${API_URL}/api/productos`, producto, this.getHeaders());
  }

  actualizarProducto(id: string, producto: any): Observable<any> {
    return this.http.put(`${API_URL}/api/productos/${id}`, producto, this.getHeaders());
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/api/productos/${id}`, this.getHeaders());
  }
}