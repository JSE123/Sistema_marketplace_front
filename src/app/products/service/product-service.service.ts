import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { concatMap, forkJoin, from, last, map, Observable, switchMap } from 'rxjs';
import { Product } from '../../core/model/product.model';
import { AuthService } from '../../auth/service/auth.service';
import { ProductRequest } from '../product-form/add-product/product-create-request';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor() { }

  _http = inject(HttpClient);
  _authService = inject(AuthService);


  private apiUrl = 'http://localhost:8080/api/products/'; // URL de la API


  getProducts(): Observable<Product[]>{

    return this._http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: string): Observable<any>{
    console.log('ID del producto:', id);
    return this._http.get<any>(this.apiUrl + id);
  }

  // createProduct(product: ProductRequest): Observable<Product>{
  //   return this._http.post<Product>(this.apiUrl, product);
  // }

  saveProduct(productData: any): Observable<any>{
    return this._http.post<Product>(this.apiUrl, productData);
  }

  uploadImage(productId: string, imageFile: File, isMain: boolean = false): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    // formData.append('isMain', String(isMain));

    console.log('Subiendo imagen:', formData.get('image'));
    
    return this._http.post(`${this.apiUrl}${productId}/upload-image`, formData);
  }

  // Método completo para guardar producto con imágenes
  createProductWithImages(productData: any, images: File[]): Observable<any> {
    // console.log('Datos del producto:', productData);
    return this.saveProduct(productData).pipe(
      switchMap((response: any) => {
        const productId = response.id;
        if (images.length === 0) {
          return this.getProductById(productId); // Si no hay imágenes, devuelve el producto
        }
        // return this.uploadImage(productId, images[0])
        return from(images).pipe(
           concatMap((image, index) => 
            this.uploadImage(productId, image, index === 0)
          ),
          last(),
          switchMap(() => this.getProductById(productId))
        )
      })
    );
   
  }

  getUserProducts(userId: string): Observable<Product[]> {
    return this._http.get<Product[]>(`${this.apiUrl}get-my-products`);
  } 

  deleteProduct(productId: string): Observable<any> {
    return this._http.delete(`${this.apiUrl}${productId}`);
  }

  updateProduct(productId: string, productData: any, images: File[]): Observable<any> {
    return this._http.patch(`${this.apiUrl}${productId}`, productData).pipe(
      switchMap((response: any) => {
        
       
        if (images.length === 0) {
          return this.getProductById(productId); // Si no hay imágenes, devuelve el producto
        }
        // return this.uploadImage(productId, images[0])
        return from(images).pipe(
           concatMap((image, index) => 
            this.uploadImage(productId, image, index === 0)
          ),
          last(),
          switchMap(() => this.getProductById(productId))
        )
      })
    );
  }

  //Metodo para obtener productos por categoría
  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this._http.get<Product[]>(`${this.apiUrl}category/${categoryId}`);
  }

  // Método para buscar productos por nombre
  searchProduct(searchTerm: string): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => this.filterProductos(products, searchTerm))
    );
  }

  private filterProductos(productos: any[], termino: string): any[] {
    if (!termino) return productos;
    
    const lowerTerm = termino.toLowerCase();
    return productos.filter(p => 
      p.title.toLowerCase().includes(lowerTerm) ||
      (p.description && p.description.toLowerCase().includes(lowerTerm)) 
    );
    return productos;
  }

}


