import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { obtenerCabeceras } from '../shared/utils/auth-headers';

const API_URL = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoService {

  constructor(private http: HttpClient) { }

  private getHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders(obtenerCabeceras()) };
  }

  getEjercicios(): Observable<any> {
    return this.http.get(`${API_URL}/api/ejercicios`, this.getHeaders());
  }

  guardarSesion(sesion: any): Observable<any> {
    return this.http.post(`${API_URL}/api/sesiones`, sesion, this.getHeaders());
  }


  getPlantillas(): Observable<any> {
    return this.http.get(`${API_URL}/api/plantillas`, this.getHeaders());
  }

  asignarRutina(rutinaSocio: any): Observable<any> {
    return this.http.post(`${API_URL}/api/rutinas-socios`, rutinaSocio, this.getHeaders());
  }

  getAsistencias(anio: number, mes: number): Observable<any> {
    return this.http.get(`${API_URL}/api/asistencias?anio=${anio}&mes=${mes}`, this.getHeaders());
  }

  getDetalleSesion(sesionId: string): Observable<any> {
    return this.http.get(`${API_URL}/api/asistencias/sesion/${sesionId}`, this.getHeaders());
  }

  borrarAsistencia(payload: any): Observable<any> {
    const options = {
      headers: new HttpHeaders(obtenerCabeceras()),
      body: payload
    };
    return this.http.delete(`${API_URL}/api/asistencias/registro`, options);
  }

  getAsistenciasMesActual(): Observable<any> {
    return this.http.get(`${API_URL}/api/asistencias/mes-actual`, this.getHeaders());
  }

  getMiRutina(): Observable<any> {
    return this.http.get(`${API_URL}/api/rutinas-socios/mi-rutina`, this.getHeaders());
  }

  getMiHistorial(): Observable<any> {
    return this.http.get(`${API_URL}/api/sesiones/mi-historial`, this.getHeaders());
  }

  getSiguienteDia(totalDias: number): Observable<any> {
    return this.http.get(`${API_URL}/api/sesiones/siguiente-dia?totalDias=${totalDias}`, this.getHeaders());
  }
}