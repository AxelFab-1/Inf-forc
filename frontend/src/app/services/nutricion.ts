import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/utils/api-config';
import { obtenerCabeceras } from '../shared/utils/auth-headers';

@Injectable({
  providedIn: 'root'
})
export class NutricionService {

  constructor(private http: HttpClient) { }

  private getHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders(obtenerCabeceras()) };
  }

  getPerfil(): Observable<any> {
    return this.http.get(`${API_URL}/api/nutricion/perfil`, this.getHeaders());
  }

  registrarPerfil(datos: any): Observable<any> {
    return this.http.post(`${API_URL}/api/nutricion/registrar`, datos, this.getHeaders());
  }
}