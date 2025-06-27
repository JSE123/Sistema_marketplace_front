import { inject, Injectable } from '@angular/core';
import { Category } from '../../model/product.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private url: string = 'http://localhost:8080/api/categories'; 
  private _http: HttpClient = inject(HttpClient);

  constructor() { }

  getAllCategories(): Observable<any[]> {
    return this._http.get<any []>(this.url);
  }

  deleteCategory(id: number): Observable<any> {
    return this._http.delete(`${this.url}/${id}`);
  }

  createCategory(category: Category): Observable<Category> {
    return this._http.post<Category>(this.url, category);
  }

  updateCategory(category: Category): Observable<Category> {
    // console.log('Updating category:', `${this.url}/${category.id}`);
    console.log('Updating category:', category);
    return this._http.put<Category>(`${this.url}/${category.id}`, category);
  }
}
