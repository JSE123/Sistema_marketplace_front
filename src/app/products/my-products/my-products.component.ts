import { Component } from '@angular/core';
import { HaederComponent } from "../../shared/haeder/haeder.component";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../service/product-service.service';
import { AuthService } from '../../auth/service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { query } from '@angular/animations';
import { SalesProductService } from '../service/sales-product.service';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [RouterModule,HaederComponent, CommonModule,ReactiveFormsModule, FormsModule],
  templateUrl: './my-products.component.html',
  styleUrl: './my-products.component.scss'
})
export class MyProductsComponent {
// Datos del usuario
  userId: string | null = null;
  
  // Estadísticas
  totalProducts: number = 0;
  activeProducts: number = 0;
  soldProducts: number = 0;
  totalEarnings: number = 0;
  
  // Lista de productos
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  
  // Filtros
  searchQuery: string = '';
  statusFilter: string = 'all';
  sortBy: string = 'newest';
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;
  
  // Modal
  showDeleteModal: boolean = false;
  productToDelete: string | null = null;
  
  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private _SalesProductService: SalesProductService

  ) { }
  
  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();
    if (this.userId) {
      this.loadProducts();
    }
    // Obtener las ventas del usuario
    this.getSalesByUserId();
  }

  getSalesByUserId(): void {
    this._SalesProductService.getUserSales(this.userId!).subscribe({
      next: (sales) => {
        // Calcular cantidad de ventas y ganancias totales
        this.soldProducts = sales.length
        this.totalEarnings = sales.reduce((sum, sale) => sum + sale.total, 0);
        console.log('Ventas del usuario:', sales);
      },
      error: (err) => {
        console.error('Error al obtener las ventas del usuario:', err);
      }
    });
  }
  
  loadProducts(): void {
    this.productService.getUserProducts(this.userId!).subscribe({
      next: (products) => {
        this.allProducts = products;
        console.log('Productos cargados:', this.allProducts);
        this.calculateStats();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading products:', err);
      }
    });
  }
  
  calculateStats(): void {
    this.totalProducts = this.allProducts.length;
    this.activeProducts = this.allProducts.filter(p => p.status === 'active').length;
    this.soldProducts = this.allProducts.filter(p => p.status === 'sold').length;
    this.totalEarnings = this.allProducts
      .filter(p => p.status === 'sold')
      .reduce((sum, product) => sum + (product.price * product.sales), 0);
  }
  
  applyFilters(): void {
    // Aplicar filtro de búsqueda
    let filtered = this.allProducts;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }
    console.log('Productos filtrados por búsqueda:', this.filteredProducts);
    
    // Aplicar filtro de estado
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.statusFilter);
    }
    
    // Aplicar ordenamiento
    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.sales - a.sales);
        break;
    }
    
    this.filteredProducts = filtered;
    this.updatePagination();
  }
  
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
  }
  
  getPaginatedProducts(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts.slice(start, end);
  }
  
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  
  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'sold': return 'Vendido';
      case 'draft': return 'Borrador';
      default: return status;
    }
  }
  
  editProduct(productId: string): void {
    // Navegar a la página de edición
    this.router.navigate(['/edit-product', productId]);
  }
  
  toggleActive(product: any): void {
    // const newStatus = product.status === 'active' ? 'inactive' : 'active';
    // this.productService.updateProductStatus(product.id, newStatus).subscribe({
    //   next: () => {
    //     product.status = newStatus;
    //     this.calculateStats();
    //     this.applyFilters();
    //   },
    //   error: (err) => {
    //     console.error('Error updating product status:', err);
    //   }
    // });
  }
  
  confirmDelete(productId: string): void {
    this.productToDelete = productId;
    this.showDeleteModal = true;
  }
  
  deleteProduct(): void {
    if (!this.productToDelete) return;
    
    this.productService.deleteProduct(this.productToDelete).subscribe({
      next: () => {
        this.allProducts = this.allProducts.filter(p => p.id !== this.productToDelete);
        this.calculateStats();
        this.applyFilters();
        this.loadProducts();
        this.showDeleteModal = false;
        this.productToDelete = null;
        console.log('Producto eliminado correctamente');
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.showDeleteModal = false;
      }
    });
  }

  
}
