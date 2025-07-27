import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HaederComponent } from "../shared/haeder/haeder.component";
import { Product } from '../core/model/product.model';
import { ProductService } from '../products/service/product-service.service';
import { TokenService } from '../core/Service/token.service';
import { CategoryService } from '../core/Service/category-service/category.service';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../shared/footer/footer.component";
import { RatingService } from '../core/Service/rating-service/rating.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, HaederComponent, FormsModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  private _productService = inject(ProductService);
  private _tokenService = inject(TokenService);//dependencia de tokenService
  private _router = inject(Router);
  private _categoryService = inject(CategoryService);
  private _route = inject(ActivatedRoute);
  private _ratingService = inject(RatingService);

  listaProductos: Product[] = [];
  categories: any[] = []; // 
  searchTerm: string = '';
  featuredSellers: any[]  = []; 



  categoryImages: { [key: string]: string } = {
    'moda': 'public\images\bicicleta.jpeg',
    'electronica': 'https://plus.unsplash.com/premium_photo-1683120974913-1ef17fdec2a8?q=80&w=663&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'hogar': 'https://images.unsplash.com/photo-1592178036777-6cb668714b72?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fGhvbWUlMjBhcGxpYW5jZXxlbnwwfHwwfHx8MA%3D%3D',
    'almacenamiento': 'https://images.unsplash.com/photo-1704265586128-7fc54dcc774f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3RvcmFnZSUyMGNvbXB1dGVyfGVufDB8fDB8fHww',
    'software': 'https://plus.unsplash.com/premium_photo-1661963874418-df1110ee39c1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c29mdHdhcmV8ZW58MHx8MHx8fDA%3D',
    'hardware': 'https://images.unsplash.com/photo-1591238372408-8b98667c0460?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aGFyZHdhcmV8ZW58MHx8MHx8fDA%3D',
    'deporte': 'https://images.unsplash.com/photo-1739134472056-8164f74227d8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHNwb3J0cyUyMGl0ZW18ZW58MHx8MHx8fDA%3D',
    'juguetes': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8dG95c3xlbnwwfHwwfHx8MA%3D%3D',
    'vestimenta': 'https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2xvdGhlc3xlbnwwfHwwfHx8MA%3D%3D'
  };

  getCategoryImage(categoryName: string): string {
    return this.categoryImages[categoryName.toLowerCase()] || 'assets/images/default-category.png';
  }

  ngOnInit(){
    // Verificar si el token está presente y no ha expirado
    if (this._tokenService.isTokenExpired()) {
      this._tokenService.removeToken();
    }

    // Cargar los productos al iniciar el componente
    this.cargarDatos();
    
    // Cargar las categorías al iniciar el componente
    this.cargarCategorias();
    
    // Llamar a la función para desplazarse a la sección de categorías
    this.scrollToCategoris();

    this.loadTopRatedSellers();


  }

  scrollToCategoris(): void{
    this._route.fragment.subscribe(fragment => {
      if (fragment === 'categories-section') {
        setTimeout(() => { // Pequeño delay para asegurar renderizado
          const element = document.getElementById('categories-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    });
  }

  cargarDatos(){
    this._productService.getProducts().subscribe((data) => {

      this.listaProductos = data.slice(0, 10); // Cargar solo los primeros 10 productos
      console.log(this.listaProductos);
      // console.log(this.listaProductos[0].imageUrls[0]); 
    });
  }

  //Metodo para cargar las categorias
  cargarCategorias() {
    this._categoryService.getAllCategories().subscribe((data) => {
      this.categories = data.slice(0, 8); // Cargar solo las primeras 8 categorías
      // console.log(this.categories);
    }
    );
  }
  


  goToProductDetails(productId: number): void {
    // Navegar a la página de detalles del producto
    this._router.navigate(['product', productId]);

  }

  loadTopRatedSellers(){
    this._ratingService.getTopRatedSellers().subscribe(
      (data) => {
        this.featuredSellers = data;
        console.log('Vendedores destacados:', this.featuredSellers);
      },
      (error) => {
        console.error('Error al cargar los vendedores destacados:', error);
      }
    );

  };

  navigateToProfile(id: string): void {
    // Navegar a la página de perfil del usuario
    this._router.navigate(['/profile', (id)]);
  }



 
}
