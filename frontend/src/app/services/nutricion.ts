import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { obtenerCabeceras, obtenerCabecerasArchivo } from '../shared/utils/auth-headers';

const API_URL = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class NutricionService {

  constructor(private http: HttpClient) { }

  private getHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders(obtenerCabeceras()) };
  }

  private getHeadersArchivo(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders(obtenerCabecerasArchivo()) };
  }

  getPerfil(): Observable<any> {
    return this.http.get(`${API_URL}/api/nutricion/perfil`, this.getHeaders());
  }

  registrarPerfil(datos: any): Observable<any> {
    return this.http.post(`${API_URL}/api/nutricion/registrar`, datos, this.getHeaders());
  }

  getHistorialChat(): Observable<any> {
    return this.http.get(`${API_URL}/api/chat-nutricion/historial`, this.getHeaders());
  }

  enviarMensajeChat(texto: string, archivo: File | null): Observable<any> {
    const formData = new FormData();
    if (texto) {
      formData.append('texto', texto);
    }
    if (archivo) {
      formData.append('imagen', archivo);
    }

    return this.http.post(
      `${API_URL}/api/chat-nutricion/enviar`,
      formData,
      this.getHeadersArchivo()
    );
  }
}