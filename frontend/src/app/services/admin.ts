import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { obtenerCabeceras, obtenerCabecerasArchivo } from '../shared/utils/auth-headers';

const API_URL = environment.API_URL;

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

  crearProducto(formData: FormData): Observable<any> {
    const headers = new HttpHeaders(obtenerCabecerasArchivo());
    return this.http.post(`${API_URL}/api/productos`, formData, { headers });
  }

  actualizarProducto(id: string, formData: FormData): Observable<any> {
    const headers = new HttpHeaders(obtenerCabecerasArchivo());
    return this.http.put(`${API_URL}/api/productos/${id}`, formData, { headers });
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/api/productos/${id}`, this.getHeaders());
  }

  getEjercicios(): Observable<any> {
    return this.http.get(`${API_URL}/api/ejercicios`, this.getHeaders());
  }

  crearEjercicio(formData: FormData): Observable<any> {
    const headers = new HttpHeaders(obtenerCabecerasArchivo());
    return this.http.post(`${API_URL}/api/ejercicios`, formData, { headers });
  }

  actualizarEjercicio(id: string, formData: FormData): Observable<any> {
    const headers = new HttpHeaders(obtenerCabecerasArchivo());
    return this.http.put(`${API_URL}/api/ejercicios/${id}`, formData, { headers });
  }

  eliminarEjercicio(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/api/ejercicios/${id}`, this.getHeaders());
  }
}