import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  // Url de la API
  private apiUrl = 'http://localhost:8080/api/reputation';
  // Inyección de HttpClient
  private _http = inject(HttpClient);


  constructor() { }


  // Método para obtener los comentatrio de un producto 
  getReputations(productId: number): Observable<any> {
    return this._http.get(`${this.apiUrl}/${productId}`);
  }

  // Método para crear un nuevo comentario
  createReputation(reputation: any): Observable<any> {
    return this._http.post(this.apiUrl, reputation);
  }
}
