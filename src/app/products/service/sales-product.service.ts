import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class SalesProductService {
  // URL de la API de ventas
  private apiUrl = `${environment.apiUrl}/api/sales/`;

  // Inyectar HttpClient para realizar peticiones HTTP
  private _http = inject(HttpClient);

  constructor() { }

  //Funcion para registrar una venta y decrementar el stock del producto
  /**
   * Registra una venta y decremente el stock del producto.
   * @param saleData Datos de la venta a registrar.
   * @returns Observable con la respuesta de la API.
   */
  registerSale(saleData: any): Observable<any> {

    return this._http.post<any>(this.apiUrl, saleData);

  }

  //Funcion para obtener las ventas de un usuario
  /**
   * Obtiene las ventas de un usuario.
   * @param userId ID del usuario cuyas ventas se desean obtener.
   * @returns Observable con la lista de ventas del usuario.
   */
  getUserSales(userId: string): Observable<any[]> {
    return this._http.get<any[]>(`${this.apiUrl}${userId}/get-by-user`);
  }
}
