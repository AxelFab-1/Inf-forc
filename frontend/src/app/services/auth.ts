import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 
import { obtenerCabeceras, obtenerCabecerasArchivo } from '../shared/utils/auth-headers';

const API_URL = environment.API_URL;

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private http: HttpClient) { }

  
  private getHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders(obtenerCabeceras()) };
  }

  private getHeadersArchivo(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders(obtenerCabecerasArchivo()) };
  }


  login(credenciales: any): Observable<any> {  
    return this.http.post(`${API_URL}/api/login`, credenciales); 
  }


  cambiarPassword(body: any): Observable<any> {
    return this.http.put(`${API_URL}/api/usuarios/cambiar-password`, body, this.getHeaders());
  }

  getMiPerfil(): Observable<any> {
    return this.http.get(`${API_URL}/api/usuarios/me`, this.getHeaders());
  }

  subirAvatar(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', archivo);

    // No agregamos Content-Type explícito porque el navegador setea boundary automáticamente
    return this.http.post(`${API_URL}/api/usuarios/me/avatar`, formData, this.getHeadersArchivo());
  }
}

