import { Component, inject, ViewChild } from '@angular/core';
import { UserService } from '../../core/Service/user-service/user.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { HaederComponent } from '../../shared/haeder/haeder.component';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
@Component({
  selector: 'app-manage-users',
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
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss'
})
export class ManageUsersComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // datos para tabla
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['number', 'name', 'username', 'actions'];

  pageSizeOptions = [5, 10, 25, 100]; // Opciones de items por página
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  searchQuery: string = '';
  currentUser: any = null;
  isModalOpen: boolean = false;
  isUpdateModalOpen: boolean = false;

  //roles
  roles: string[] = ['ADMIN', 'USER', 'SELLER','GUEST'];

  //inyectar servicio de usuarios
  private userService = inject(UserService);

  private snackBar = inject(MatSnackBar);
  

  userForm = inject(FormBuilder).group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.maxLength(50)]],
  });

  // Validaciones del formulario para actualizar usuario
  userUpdateForm = inject(FormBuilder).group({
    role: ['', [Validators.required]]
  })

  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }


  ngOnInit(): void{
    //llamar funcion para cargar usuarios
    this.loadUsers();
    console.log("Usuarios cargados:", this.allUsers);
  }

  //funcion para cargar usuarios
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        // this.allUsers = users;
        this.dataSource.data = users;
        this.filteredUsers = users; // Inicialmente, todos los usuarios son visibles
        console.log('Usuarios cargados:', this.dataSource.data);
      },
      error: (error) => {
        console.error('Error al cargar los usuarios:', error);
      }
    });
  }

  //funcion para abrir modal
  openModal(user?: any): void {
    this.isModalOpen = true;
    if(user){
      this.currentUser = user; // Establecer el usuario actual para editar
      // this.userForm.patchValue({
      //   name: user.name,
      //   username: user.username
      // });
    }

  }

  //funcion para cerrar modal
  closeModal(): void { 
    this.isModalOpen = false;
    this.currentUser = null; // Limpiar el usuario actual al cerrar el modal
    this.userForm.reset(); // Reiniciar el formulario
  } 
  //funcion para abrir modal
  openModalUpdate(user?: any): void {
    this.isUpdateModalOpen = true;
    if(user){
      this.currentUser = user; // Establecer el usuario actual para editar
      
    }

  }

  //funcion para cerrar modal
  closeModalUpdate(): void { 
    this.isUpdateModalOpen = false;
    this.currentUser = null; // Limpiar el usuario actual al cerrar el modal
    this.userForm.reset(); // Reiniciar el formulario
  } 

  //funcion para guardar usuario
  saveUser(): void {

  }

  deleteUser(id: number): void {
    
    if(confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      this.userService.deleteUser(id).subscribe({
        next: () => { 
          this.loadUsers(); // Recargar la lista de usuarios después de eliminar
          this.applyFilters(); // Aplicar filtros para actualizar la vista
        },
        error: (error) => {
          console.error('Error al eliminar el usuario:', error);
        }
      })
      this.filteredUsers= this.filteredUsers.filter(c => c.id !== id);
      this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
    }
  }

  //funcion para filtrar usuarios
  applyFilters(): void {
    if (this.searchQuery.trim() === '') {
      // this.dataSource.data = this.filteredUsers; // Si no hay consulta de búsqueda, mostrar todos los usuarios
      this.dataSource.filter = '';
    } else {
      // Filtrar usuarios por nombre de usuario y nombre
      this.dataSource.filter = this.searchQuery.trim().toLowerCase();
      // this.dataSource.data = this.filteredUsers.filter(user =>
      //   user.username.toLowerCase().includes(this.searchQuery.toLowerCase())
      // );
    }
  }

  //funcion para actualizar usuario
  updateUserRoles(): void {
    if (this.userUpdateForm.valid && this.currentUser) {
      const updatedRole = this.userUpdateForm.value.role;
      console.log('Rol actualizado:', updatedRole);
      this.userService.updateUserRole(this.currentUser.id, updatedRole!).subscribe({
        next: () => {
          this.snackBar.open('Rol de usuario actualizado', 'Cerrar', { duration: 3000 });
          this.closeModalUpdate(); // Cerrar el modal después de actualizar
          this.loadUsers(); // Recargar la lista de usuarios
        },
        error: (error) => {
          console.error('Error al actualizar el rol del usuario:', error);
          this.snackBar.open('Error al actualizar el rol del usuario', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  

}
