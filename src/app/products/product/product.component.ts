import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../service/product-service.service';
import { HaederComponent } from "../../shared/haeder/haeder.component";
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatInputModule,
    MatListModule,
    MatDividerModule,
    HaederComponent,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    RouterModule
    
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  allProductos: any[] = []; // Todos los productos sin paginar
  displayedProductos: any[] = []; // Productos a mostrar en la página actual
  loading = true;
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  categoriaId = '';
  categoriaNombre = '';

  constructor(
    private productosService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || '';
      this.categoriaId = params['category'] || '';
      this.categoriaNombre = params['nombre'] || '';
      this.currentPage = parseInt(params['page']) || 1;
      this.loadProductos();
    });

    console.log('Search Term:', this.categoriaId);
  }

  loadProductos(): void {
    this.loading = true;
    
    let observable;
    if (this.searchTerm) {
      observable = this.productosService.searchProduct(this.searchTerm);
    } else if (this.categoriaId) {
      observable = this.productosService.getProductsByCategory(this.categoriaId);
    } else {
      observable = this.productosService.getProducts();
    }

    observable.subscribe({
      next: (productos) => {
        this.allProductos = productos;
        console.log('Productos obtenidos:', this.allProductos[0]);
        this.updateDisplayedProductos();
        this.loading = false;
      },
      error: (err) => {
        console.error("Eror que estamos buscando: "+err);
        this.loading = false;
      }
    });
  }

  updateDisplayedProductos(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedProductos = this.allProductos.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateUrl();
    this.updateDisplayedProductos();
  }

  updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchTerm || null,
        categoria: this.categoriaId || null,
        nombre: this.categoriaNombre || null,
        page: this.currentPage > 1 ? this.currentPage : null
      },
      queryParamsHandling: 'merge'
    });
  }

  get totalItems(): number {
    return this.allProductos.length;
  }
}
