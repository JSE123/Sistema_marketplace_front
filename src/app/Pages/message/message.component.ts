import { Component, inject } from '@angular/core';
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
import { timestamp } from 'rxjs';


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
export class MessageComponent {
// Servicios
  private messagingService = inject(MessageService);

  // Iconos
  // icons = {
  //   comment: faComment,
  //   send: faPaperPlane,
  //   menu: faEllipsisVertical,
  //   search: faSearch,
  //   close: faTimes,
  //   notification: faBell,
  //   readReceipt: faCheckDouble
  // };

  // Inyecciones
  private _authService = inject(AuthService);

  // Estado del componente
  conversations: any[] = [];
  selectedConversation: any = null;
  newMessage = '';
  searchTerm = '';
  currentUser: any = { id: 0, name: 'Usuario Actual', avatar: '' };
  isMobileView = false;
  unreadCount = 0;
  conversationsPanelVisible = false;

  ngOnInit() {
    this.checkViewport();
    window.addEventListener('resize', () => this.checkViewport());
    
    this.currentUser.id = this._authService.getCurrentUserId();

    this.loadConversations();
    this.setupRealTimeUpdates();
  }

  private checkViewport() {
    this.isMobileView = window.innerWidth < 768;
  }

  private loadConversations() {
    console.log("id de usuario actual:", this.currentUser.id);
    this.messagingService.getConversations(this.currentUser.id).subscribe({
      next: (conversations) => {
        
        // console.log('Cantidad de mensajes de la conversacion:', conversations[0].messages.length);
        console.log('Conversations loaded:', conversations);
        //ordenar conversaciones por fecha de actualización
        conversations.sort((a, b) => new Date(b.messages[b.messages.length-1].timestamp).getTime() - new Date(a.messages[a.messages.length-1].timestamp).getTime());
        
        this.conversations = conversations;
        console.log('Conversations local:', this.conversations[0].messages[0].recipientName || this.conversations[0].messages[0].recipientUsername);
        this.unreadCount = conversations.filter(c => c.unreadCount > 0).length;
        console.log('Unread count:', this.unreadCount);
      },
      error: (err) => console.error('Error loading conversations', err)
    });
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
}
