import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';
import { FormsModule } from '@angular/forms';
import { NotificationsService } from '../../core/Service/notification-service/notifications.service';

@Component({
  selector: 'app-haeder',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule],
  templateUrl: './haeder.component.html',
  styleUrl: './haeder.component.scss'
})
export class HaederComponent {
  showUserMenu = false;
  isAuthenticated = false;
  currentUser: any = null;
  currentUserId: string | null = null;
  private _authService = inject(AuthService);
  searchTerm = '';
  notificationList: any[] = [];
  notificationCount = 0;
  showNotificationMenu = false;

  isAdmin = false;
  isUser = false;




  private authSubscription!: Subscription;

  userName = 'Juan Pérez'; // Esto debería venir de tu servicio de autenticación
  userAvatar = 'images/logo_usuario.png'; // Imagen por defecto


  constructor(private router: Router, private elementRef: ElementRef, private _notificationService: NotificationsService) {
    this.isAdmin = this._authService.hasRole('ROLE_ADMIN');
    this.isUser = this._authService.hasRole('ROLE_USER');
  }

  ngOnInit(){
    this.authSubscription = this._authService.isAuthenticated$.subscribe(
      (authenticated) => {
        this.isAuthenticated = authenticated;
        // this.currentUser = this._authService.getCurrentUser();
       

      }
    );

    this.currentUser = this._authService.getUsername();
    this.currentUserId = this._authService.getCurrentUserId();

    this.loadNotifications();
    this._notificationService.getNotificationsByUserId(this.currentUserId!).subscribe((notifications) => {
      this.notificationList = notifications;
       // Count notifications unread
      this.notificationCount = this.notificationList.filter(n => !n.read).length;
    });
  }


  scrollToCategories() {
    if (this.router.url === '/') {
      // Si ya estamos en home, usa scroll nativo
      const element = document.getElementById('categories-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Si no estamos en home, navega a home con fragmento
      this.router.navigate(['/'], { fragment: 'categories-section' });
    }
  }


  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleNotificationMenu() {
    this.showNotificationMenu = !this.showNotificationMenu;
    if(this.showNotificationMenu) {
      this.notificationCount = 0; // Resetea el contador al abrir el menú
      this.notificationList.forEach(notification => notification.read = true); // Marca todas como leídas
      this._notificationService.markAllAsRead(this.currentUserId!).subscribe(
        response => {
          console.log('Todas las notificaciones marcadas como leídas:', response);
        },
        error => {
          console.error('Error al marcar notificaciones como leídas:', error);
        }
      ); // Llama al servicio para marcar como leídas
    }
  }

  // Cerrar menú al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showUserMenu = false;
      this.showNotificationMenu = false;
    }
  }

  logout() {
    // Aquí iría la lógica para cerrar sesión
    this._authService.logout();
    // this.router.navigate(['/login']);
    this.showUserMenu = false;
  }

  loadNotifications() {
    const userId = this._authService.getCurrentUserId();
    this._notificationService.getNotifications().subscribe((newNotification) => {
      // this.toastr.info(notification.content, 'Nueva Notificación');  

      this.notificationList.unshift(newNotification);
      if (!newNotification.read) {
        this.notificationCount++;
      }
    });
  }
}
