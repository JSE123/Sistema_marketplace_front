import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../service/product-service.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HaederComponent } from "../../shared/haeder/haeder.component";
import { Product } from '../../core/model/product.model';
import { TokenService } from '../../core/Service/token.service';
import { SalesProductService } from '../service/sales-product.service';
import { AuthService } from '../../auth/service/auth.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HaederComponent, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent {
  // product: Product | null = null;
  productId: string | null = null;
  product: any;
  relatedProducts: any[] = [];
  selectedImage: string | null = null;
  quantity: number = 1;



  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private _tokenService: TokenService,
    private _router: Router,
    private saleService: SalesProductService,
    ) { }

  ngOnInit(): void {
     // Verificar si el token está presente y no ha expirado
    if (this._tokenService.isTokenExpired()) {
      this._tokenService.removeToken();
    }
    // const productId = this.route.snapshot.paramMap.get('id');
    // if (productId) {
      
    //   this.loadProductDetails(productId);
    // } 
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      this.loadProductDetails(this.productId!);
    });
  }

  loadProductDetails(productId: string): void {
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.loadRelatedProducts(this.product.category.id); // Asumiendo que el producto tiene una propiedad categoryId

      },
      error: (err) => {
      }
    });
  }

  //Metodo para cargar productos relacionados de la misma categoria
  loadRelatedProducts(categoryId: string): void {
    //llamar al servicio para obtener productos relacionados
    this.productService.getProductsByCategory(categoryId).subscribe({
      next: (products) => {
        this.relatedProducts = products.slice(0, 4); // Limitar a 4 productos relacionados
      },
      error: (err) => {
      }
    });
  }

  // Method to save purchase data
  buyNow(product: any, quantity: number): void {
    // Implement the buy now functionality here

    // Verificar si el token está presente y no ha expirado
    if (this._tokenService.isTokenExpired()) {
      this._tokenService.removeToken();
      this._router.navigate(['/login']);
      return;
    }

    // Validar la cantidad
    if (quantity <= 0) {
      console.error('Cantidad no válida. Debe ser mayor que 0.');
      return;
    }

    // Crear un objeto de compra
    const purchaseData = {
      productId: product.id,
      amount: quantity,
      total: product.price * quantity,
      userId: product.user
    };
    console.log('Producto seleccionado:', purchaseData);

    // Llamar al servicio para registrar la compra
    this.saleService.registerSale(purchaseData).subscribe({
      next: (response) => {
        // Manejar la respuesta exitosa, por ejemplo, mostrar un mensaje de éxito
        console.log('Compra registrada con éxito:', response);
        this._router.navigate(['/purchases']);
      },
      error: (error) => {
        // Manejar errores, por ejemplo, mostrar un mensaje de error
        console.error('Error al registrar la compra:', error);
      }
    });
  }
  goToProductDetails(productId: number): void {
    // Navega a este mismo componente con el ID del producto
    // Esto actualizará la URL y recargará los detalles del producto
    

    this._router.navigate(['product', productId]);
     window.scrollTo(0, 0);

  }

  
}
