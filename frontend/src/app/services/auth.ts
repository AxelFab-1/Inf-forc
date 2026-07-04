import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/utils/api-config'; 
import { obtenerCabeceras } from '../shared/utils/auth-headers';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private http: HttpClient) { }

  
  private getHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders(obtenerCabeceras()) };
  }


  login(credenciales: any): Observable<any> {  
    return this.http.post(`${API_URL}/api/login`, credenciales); 
  }


cambiarPassword(body: any): Observable<any> {
    return this.http.put(`${API_URL}/api/usuarios/cambiar-password`, body, this.getHeaders());
  }
}

