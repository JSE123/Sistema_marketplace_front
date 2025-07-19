import { Component } from '@angular/core';
import { HaederComponent } from "../shared/haeder/haeder.component";
import { AuthService } from '../auth/service/auth.service';
import { ProfileServiceService } from './service/profile-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HaederComponent, FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
 activeTab: 'info' | 'products' | 'reviews' | 'settings' = 'info';
  editMode = {
    info: false,
    avatar: false,
    cover: false
  };
  showDeleteModal = false;

  // bandera de edición
  editProfile = false;

  user: any = {}
  idUserProfile: string | null = null;

  // Productos del usuario
  userProducts = [
    {
      id: '1',
      name: 'Mochila artesanal',
      price: 450,
      image: 'assets/images/product1.jpg',
      status: 'active',
      stock: 5,
      sales: 12
    },
    // ... más productos
  ];

  // Reseñas
  reviews = [
    {
      id: '1',
      reviewer: {
        name: 'María González',
        avatar: 'assets/images/avatar2.jpg'
      },
      rating: 5,
      comment: 'Excelente producto, llegó en perfecto estado y antes de lo esperado.',
      date: new Date('2023-01-15')
    },
    // ... más reseñas
  ];
  averageRating = 4.7;

  // Configuración
  userSettings = {
    emailNotifications: true,
    pushNotifications: false,
    profilePrivacy: 'public'
  };

  constructor(
    private profileService: ProfileServiceService,
    private authService: AuthService,
    // private cloudinaryService: CloudinaryService
    private route: ActivatedRoute,
    
  ) {}

  ngOnInit(): void {
   
    // this.loadReviews();

    //verifar id del usuario que se quiere ver el perfil
    const currentUserId = this.authService.getCurrentUserId();
    this.idUserProfile = this.route.snapshot.paramMap.get('id');
    if(currentUserId == this.idUserProfile) {
      this.editProfile = true;
    }
    this.loadUserData();
    this.loadUserProducts();

  }

  loadUserData(): void {
    this.profileService.getUserProfile(this.idUserProfile!).subscribe({
      next: (data) => {
        this.user = data ;
        console.log('Datos del perfil:', this.user);
      },
      error: (err) => {
        // this.showError('Error al cargar los datos del perfil');
        console.error('Error al cargar los datos del perfil', err);
      }
    });
  }

  loadUserProducts(): void {
    this.profileService.getUserProducts().subscribe({
      next: (products) => {
        this.userProducts = products;
      },
      error: (err) => {
        console.error('Error al cargar los productos', err);
        // this.showError('Error al cargar los productos');
      }
    });
  }

  // loadReviews(): void {
  //   this.profileService.getUserReviews().subscribe({
  //     next: (reviews) => {
  //       this.reviews = reviews;
  //       this.calculateAverageRating();
  //     },
  //     error: (err) => {
  //       this.showError('Error al cargar las reseñas');
  //     }
  //   });
  // }

  calculateAverageRating(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = sum / this.reviews.length;
  }

  getRatingPercentage(rating: number): number {
    const count = this.reviews.filter(r => r.rating === rating).length;
    return (count / this.reviews.length) * 100 || 0;
  }

  saveUserInfo(): void {
    let user = {
      name: this.user.name,
      lastName  : this.user.lastName,
      email: this.user.email,
      description: this.user.description,
      phone: this.user.phone,
      address: this.user.address
    }
    this.profileService.updateProfile(user).subscribe({
      next: () => {
        this.editMode.info = false;
        console.log('Perfil actualizado correctamente');
      },
      error: (err) => {
        console.error('Error al actualizar el perfil', err);
      }
    });
  }

  // updateSettings(): void {
  //   this.profileService.updateSettings(this.userSettings).subscribe({
  //     next: () => {
  //       this.showSuccess('Configuración actualizada correctamente');
  //     },
  //     error: (err) => {
  //       this.showError('Error al actualizar la configuración');
  //     }
  //   });
  // }

  changeAvatar(): void {
    console.log('Cambiar avatar');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        console.log('Archivo seleccionado:', file);
       this.profileService.updateAvatar(file).subscribe({
          next: (result: any) => {
            this.user.avatarUrl = result.url;
          }
      })
    }
    };
    
    input.click();
  }

  changeCoverPhoto(): void {
    // console.log('Cambiar foto de portada');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.profileService.updatePortada(file).subscribe({
          next: (result: any) => {
            this.user.coverPhoto = result.url;
            // this.saveUserInfo();
          },
          error: (err) => {
            console.log("Error al subir la foto de portada", err);
          }
        });
      }
    };
    
    input.click();
  }

  // editProduct(productId: string): void {
  //   console.log('Editar producto:', productId);
  //   // Navegar a la página de edición
  //   // this.router.navigate(['/products/edit', productId]);
  // }

  confirmDeleteProduct(productId: string): void {
    // Implementar lógica de confirmación
    console.log('Eliminar producto:', productId);
  }

  // deactivateAccount(): void {
  //   this.profileService.deactivateAccount().subscribe({
  //     next: () => {
  //       this.authService.logout();
  //       this.showSuccess('Tu cuenta ha sido desactivada');
  //       // this.router.navigate(['/login']);
  //     },
  //     error: (err) => {
  //       this.showError('Error al desactivar la cuenta');
  //     }
  //   });
  // }

  confirmDeleteAccount(): void {
    this.showDeleteModal = true;
  }

  // deleteAccount(): void {
  //   this.profileService.deleteAccount().subscribe({
  //     next: () => {
  //       this.authService.logout();
  //       this.showSuccess('Tu cuenta ha sido eliminada permanentemente');
  //       // this.router.navigate(['/login']);
  //     },
  //     error: (err) => {
  //       this.showError('Error al eliminar la cuenta');
  //     },
  //     complete: () => {
  //       this.showDeleteModal = false;
  //     }
  //   });
  // }

}
