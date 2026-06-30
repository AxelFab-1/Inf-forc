import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/utils/api-config';
import { obtenerCabeceras } from '../shared/utils/auth-headers';

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoService {

  constructor(private http: HttpClient) { }

  private getHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders(obtenerCabeceras()) };
  }

  // ─── GET: Obtener catálogo de ejercicios ───────────────────────
  getEjercicios(): Observable<any> {
    return this.http.get(`${API_URL}/api/ejercicios`, this.getHeaders());
  }

  // ─── POST: Guardar sesión finalizada ───────────────────────────
  guardarSesion(sesion: any): Observable<any> {
    return this.http.post(`${API_URL}/api/sesiones`, sesion, this.getHeaders());
  }

  // 👇 NUEVAS FUNCIONES AGREGADAS PARA LAS RUTINAS 👇

  // ─── GET: Obtener plantillas de rutinas ────────────────────────
  getPlantillas(): Observable<any> {
    return this.http.get(`${API_URL}/api/plantillas`, this.getHeaders());
  }

  // ─── POST: Asignar rutina al socio ─────────────────────────────
  asignarRutina(rutinaSocio: any): Observable<any> {
    return this.http.post(`${API_URL}/api/rutinas-socios`, rutinaSocio, this.getHeaders());
  }

  // ─── GET: Obtener historial por mes ────────────────────────────
  getAsistencias(anio: number, mes: number): Observable<any> {
    return this.http.get(`${API_URL}/api/asistencias?anio=${anio}&mes=${mes}`, this.getHeaders());
  }

  // ─── GET: Detalle de una sesión específica ─────────────────────
  getDetalleSesion(sesionId: string): Observable<any> {
    return this.http.get(`${API_URL}/api/asistencias/sesion/${sesionId}`, this.getHeaders());
  }

  // ─── DELETE: Borrar registro de asistencia ─────────────────────
  // OJO: HttpClient en Angular maneja los "body" en un DELETE con la propiedad "body" dentro de las opciones.
  borrarAsistencia(payload: any): Observable<any> {
    const options = {
      headers: new HttpHeaders(obtenerCabeceras()),
      body: payload
    };
    return this.http.delete(`${API_URL}/api/asistencias/registro`, options);
  }
// 👇 NUEVAS FUNCIONES PARA EL DASHBOARD 👇

  // ─── GET: Obtener asistencias del mes actual ───────────────────
  getAsistenciasMesActual(): Observable<any> {
    return this.http.get(`${API_URL}/api/asistencias/mes-actual`, this.getHeaders());
  }

  // ─── GET: Obtener la rutina activa del usuario ─────────────────
  getMiRutina(): Observable<any> {
    return this.http.get(`${API_URL}/api/rutinas-socios/mi-rutina`, this.getHeaders());
  }

  // ─── GET: Obtener el índice del siguiente día de entrenamiento ─
  getSiguienteDia(totalDias: number): Observable<any> {
    return this.http.get(`${API_URL}/api/sesiones/siguiente-dia?totalDias=${totalDias}`, this.getHeaders());
  }
}