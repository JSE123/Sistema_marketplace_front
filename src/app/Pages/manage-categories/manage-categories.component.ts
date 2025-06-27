import { Component, inject, ViewChild } from '@angular/core';
import { Categoria } from './Categorias';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { CategoryService } from '../../core/Service/category-service/category.service';
import { HaederComponent } from "../../shared/haeder/haeder.component";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';



@Component({
  selector: 'app-manage-categories',
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
    MatPaginatorModule
],
  templateUrl: './manage-categories.component.html',
  styleUrl: './manage-categories.component.scss'
})
export class ManageCategoriesComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // datos para tabla
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['number', 'name', 'actions'];

  categorias: any[] = [];
  category: Categoria = { id: 0, name: '' };
  isModalOpen = false;
  currentCategoria: Categoria | null = null;
  searchQuery: string = '';
  pageSizeOptions = [5, 10, 25, 100]; // Opciones de items por página


  private _categoryService = inject(CategoryService);

  categoriaForm = inject(FormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(50)]]
  });

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private dialogRef?: MatDialogRef<any>;

  ngOnInit(): void {
    this.loadCategorias();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadCategorias(): void {
    this._categoryService.getAllCategories().subscribe(
      (categorias: any[]) => {
        this.dataSource.data = categorias;
        this.categorias = categorias;
        // this.applyFilters();
      });
  }

  openModal(categoria?: Categoria): void {
    this.currentCategoria = categoria || null;
    
    if (categoria) {
      this.categoriaForm.patchValue({
        name: categoria.name
      });
    } else {
      this.categoriaForm.reset();
    }

    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.categoriaForm.reset();
    this.currentCategoria = null;
  }

  saveCategoria(): void {
    if (this.categoriaForm.invalid) return;

    const nombre = this.categoriaForm.value.name!;

    if (this.currentCategoria) {
      
      this.category.name = this.categoriaForm.value.name!;
      this.category.id = this.currentCategoria.id;
      // console.log("Categoria a actualizar", this.category);
      this._categoryService.updateCategory(this.category).subscribe({
        next: data => {
          console.log("Categoria actualizada", data);
          this.snackBar.open('Categoría actualizada', 'Cerrar', { duration: 3000 });
          this.loadCategorias(); // Recargar categorías después de la actualización
        },
        error: error => {
          console.error("Error al actualizar la categoría", error);
          this.snackBar.open('Error al actualizar la categoría', 'Cerrar', { duration: 3000 });
        }
      });

      // console.log("Categoria actualizada", this.currentCategoria);
    } else {
      this.category = this.categoriaForm.value as Categoria;
      this._categoryService.createCategory(this.category).subscribe({
        next: data => {
          console.log("Categoria creada", data);
          this.loadCategorias();
        },
        error: error => {
          console.error("Error al crear la categoría", error);
          this.snackBar.open('Error al crear la categoría', 'Cerrar', { duration: 3000 });
        }
      });
      // console.log("Categoria creada", this.category);
      this.snackBar.open('Categoría creada', 'Cerrar', { duration: 3000 });
    }

    this.closeModal();
  }

  deleteCategoria(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      this._categoryService.deleteCategory(id).subscribe({
        next: () => {
          console.log("Categoria eliminada", id);
        },
        error: error => {
          console.error("Error al eliminar la categoría", error);
          this.snackBar.open('Error al eliminar la categoría', 'Cerrar', { duration: 3000 });
        }
      })
      this.categorias = this.categorias.filter(c => c.id !== id);
      this.snackBar.open('Categoría eliminada', 'Cerrar', { duration: 3000 });
    }
  }

  applyFilters(){
    console.log("Aplicando filtros con la consulta:", this.dataSource);
    if (this.searchQuery.trim() === '') {
      console.log("Aplicando filtros con la consulta:", this.searchQuery);
      //volver a cargar todas las categorías si no hay consulta de búsqueda agregado al objeto dataSource.filter
      this.dataSource.filter = ''; // Limpiar el filtro para mostrar todas las categorías





      this.dataSource.data = this.categorias; // Si no hay consulta de búsqueda, mostrar todos los usuarios
    } else {
      // Filtrar usuarios por nombre de usuario y nombre
      this.dataSource.filter = this.searchQuery.trim().toLowerCase();
     
    }

  }
  // applyFilters(){
  //   let filteredCategorias = this.categorias;
  //   if (this.searchQuery) {
  //     filteredCategorias = this.categorias.filter(categoria =>
  //       categoria.name.toLowerCase().includes(this.searchQuery.toLowerCase())
  //     );
  //   }
  //   this.filteredCategories = filteredCategorias;

  // }
}
