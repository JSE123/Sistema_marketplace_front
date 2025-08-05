import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  // Url de la API
  private apiUrl = `${environment.apiUrl}/api/reputation`;  
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

  // Método para obtener los venderores mas valorados
  getTopRatedSellers(): Observable<any> {
    return this._http.get(`${this.apiUrl}/featured-sellers`);
  }
}
