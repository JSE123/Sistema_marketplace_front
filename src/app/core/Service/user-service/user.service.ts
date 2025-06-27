import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  //url de la API de usuarios
  private url: string = 'http://localhost:8080/api/users';
  // inyeccion de http client
  private _http: HttpClient = inject(HttpClient);

  //servicio de authenticacion
  private _authService = inject(AuthService);

  constructor() { }

  getUsers():  Observable<any[]> {
    return this._http.get<any[]>(this.url).pipe(
      map(users => {
        return users.filter(user => user.id !== this._authService.getCurrentUserId()); 
      })
    );
  }

  deleteUser(id: number): Observable<any> {
    return this._http.delete(`${this.url}/${id}`);
  }

  updateUserRole(id: number, role: string): Observable<any> {

    const requestBody = {
      roleListName: [role] // Estructura requerida por el API
    };
    return this._http.patch(`${this.url}/${id}`, requestBody).pipe(
      map(response => {
        // Actualizar el rol del usuario en la lista de usuarios
        console.log(response);
        return response;
      })
    );
  }
}
