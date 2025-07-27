import { Component, inject, OnDestroy } from '@angular/core';
import { MessageService } from '../../core/Service/message-service/message.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { HaederComponent } from "../../shared/haeder/haeder.component";
import { AuthService } from '../../auth/service/auth.service';
import { Observable, timestamp } from 'rxjs';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { UserService } from '../../core/Service/user-service/user.service';


@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // FontAwesomeModule,
    MatBadgeModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    HaederComponent
],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent implements OnDestroy {
// Servicios
  private messagingService = inject(MessageService);
  private _authService = inject(AuthService);
  private _userService = inject(UserService);

  // Estado del componente
  conversations: any[] = [];
  selectedConversation: any = null;
  newMessage = '';
  searchTerm = '';
  currentUser: any = { id: 0, name: 'Usuario Actual', avatar: '' };
  isMobileView = false;
  unreadCount = 0;
  conversationsPanelVisible = false;
  // Variables para nueva conversación
  user: any = {};

  private destroy$ = new Subject<void>();
  isNewConversation = false;
  recipientId?: number;

  ngOnInit() {
    this.checkViewport();
    window.addEventListener('resize', () => this.checkViewport());
    
    this.currentUser.id = this._authService.getCurrentUserId();

    // this.loadConversations();
    this.loadConversations().pipe(
    // Después de cargar, escuchar por nuevas conversaciones
    switchMap(() => this.messagingService.newConversation$),
    takeUntil(this.destroy$)
  ).subscribe(data => {
    if (data) {
      this.isNewConversation = true;
      this.recipientId = data.recipientId;
      this.initializeNewConversation();
    }
  });

    this.setupRealTimeUpdates();

    // Verificar si viene de iniciar nueva conversación
    // this.messagingService.newConversation$.pipe(
    //   takeUntil(this.destroy$)
    // ).subscribe(data => {
    //   if (data) {
    //     this.isNewConversation = true;
    //     this.recipientId = data.recipientId;
    //     this.initializeNewConversation();
    //   } 
    // });
  }

  

  loadExistingConversations() {

  }

  private checkViewport() {
    this.isMobileView = window.innerWidth < 768;
  }

  loadConversations(): Observable<void> {
  return this.messagingService.getConversations(this.currentUser.id).pipe(
    tap(conversations => {
      this.conversations = conversations;
      this.unreadCount = conversations.filter(c => c.unreadCount > 0).length;
    }),
      map(() => void 0) // Convertir a Observable<void>
    );
  }
 

  initializeNewConversation() {
    if (this.recipientId) {

      // Verificar si ya existe una conversación con este destinatario
      const existingConversation = this.conversations.find(c =>
        c.messages[0].recipientId == this.recipientId || c.messages[0].senderId == this.recipientId
      );
      console.log('Existing conversation:', this.conversations);
      console.log('Conversation already exists:', existingConversation);
      if( existingConversation) {
        this.selectedConversation = existingConversation;
      }else{
        //cargar datos del usuario
        this._userService.getUserById(this.recipientId).subscribe({
          next: (user) => {
            this.user = user;
            this.selectedConversation = {
              id: null,
              messages: [{
                id: null,
                content: '',
                senderId: this.currentUser.id,
                senderUsername: this.currentUser.name,
                senderName: this.currentUser.name,
                senderAvatar: null,
                recipientId: this.recipientId,
                recipientUsername: user.username,
                recipientname: user.name,
                recipientAvatar: '',
                timestamp: new Date(),
                status: 'SENT',
                
              }],
              unreadCount: 0,
              lastUpdated: new Date(),
            };
          },
          error: (err) => console.error('Error loading user data', err)
        });

        console.log('New conversation initialized:', this.selectedConversation);
        if(this.selectedConversation.messages[0].content == '') {
          console.log('No hay mensajes previos, iniciando nueva conversación');
        }
      }
      // con el recipientId y productId si es necesario
      console.log('Iniciando nueva conversación con:', this.recipientId);
    }
  }

  private setupRealTimeUpdates() {
    this.messagingService.onNewMessage().subscribe({
      next: (message) => {
        const conversation = this.conversations.find(c => c.id === message.conversationId);
        if (conversation) {
          conversation.lastMessage = message;
          conversation.unreadCount += 1;
          this.unreadCount = this.conversations.filter(c => c.unreadCount > 0).length;
        }
      }
    });
  }

  selectConversation(conversation: any) {
    this.selectedConversation = conversation;
    console.log('Selected conversation:', conversation);
    if (conversation.unreadCount > 0) {
      console.log('Marking conversation as read:', conversation.id);
      this.messagingService.markAsRead(conversation.id).subscribe();
      conversation.unreadCount = 0;
      this.unreadCount = this.conversations.filter(c => c.unreadCount > 0).length;
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    const message: any = {
      content: this.newMessage,
      senderId: this.currentUser.id,
      recipientId: this.selectedConversation.messages[0].senderId === this.currentUser.id ? this.selectedConversation.messages[0].recipientId : this.selectedConversation.messages[0].senderId,
      timestamp: new Date(),
      status: 'SENT',
    };

    console.log('Sending message:', message);
    this.messagingService.sendMessage(message).subscribe({
      next: () => {
        this.selectedConversation.messages.push(message);
        this.newMessage = '';
      },
      error: (err) => console.error('Error sending message', err)
    });
  }

  searchConversations() {
    console.log('Searching conversations with term:', this.conversations);
    // Implementar lógica de búsqueda
    if (this.searchTerm.trim()) {
      this.conversations = this.conversations.filter(conversation => 
        // conversation.messages[0].senderName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        conversation.messages[0].senderUsername.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        // conversation.messages[0].recipientName.toLowerCase().includes(this.searchTerm.toLowerCase())||
        conversation.messages[0].recipientUsername.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.loadConversations(); // Reset to all conversations
    }
  }

  closeConversation() {
    this.selectedConversation = null;
  }

  ngOnDestroy() {
    this.messagingService.clearNewConversation();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
