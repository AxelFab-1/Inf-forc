import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../shared/utils/api-config';
import { obtenerCabeceras } from '../shared/utils/auth-headers';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  private getHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders(obtenerCabeceras()) };
  }

  getUsuarios(): Observable<any> {
    return this.http.get(`${API_URL}/api/usuarios`, this.getHeaders());
  }

  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${API_URL}/api/usuarios`, usuario, this.getHeaders());
  }

  actualizarUsuario(id: string, datos: any): Observable<any> {
    return this.http.put(`${API_URL}/api/usuarios/${id}`, datos, this.getHeaders());
  }

  
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