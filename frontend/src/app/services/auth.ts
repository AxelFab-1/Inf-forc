import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/utils/api-config'; // Tu configuración de la ruta base
import { obtenerCabeceras } from '../shared/utils/auth-headers';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  // 👇 ESTO ES LO QUE TE FALTABA: Definir el helper
  private getHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders(obtenerCabeceras()) };
  }

  // Aquí vamos a meter las funciones que reemplazarán a tus fetch
  // Ejemplo de cómo se verá tu Login:
  
  login(credenciales: any): Observable<any> {
    // Usamos tu API_URL dinámica para que tu amigo no sufra al pasarlo a la nube
    return this.http.post(`${API_URL}/api/login`, credenciales); 
  }
cambiarPassword(body: any): Observable<any> {
    return this.http.put(`${API_URL}/api/usuarios/cambiar-password`, body, this.getHeaders());
  }
}