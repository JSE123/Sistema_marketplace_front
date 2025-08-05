import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from '../../../auth/service/auth.service';
import { environment } from '../../../../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private newConversationSubject = new BehaviorSubject<{ recipientId?: number} | null>(null);
  newConversation$ = this.newConversationSubject.asObservable();

  startNewConversation( recipientId: number) {
    this.newConversationSubject.next({ recipientId });
  }

  clearNewConversation() {
    this.newConversationSubject.next(null);
  }

  // Api url
  private apiUrl = `${environment.apiUrl}/api/messages`; 

  // Inyeccion de dependencias
  private http: HttpClient = inject(HttpClient);

  // private _authService = inject(AuthService);

  private newMessageSubject = new Subject<any>();

  constructor() { }

 


  getConversations(userId: number): Observable<any[]> {
    // Get current user ID from AuthService
    return this.http.get<any[]>(`${this.apiUrl}/conversations/${userId}`);
    // return this.http.get<any[]>(`${this.apiUrl}/conversations/${userId}`);
  }

  getMessages(conversationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations/${conversationId}`);
  }

  sendMessage(message: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, message);
  }

  markAsRead(conversationId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/mark-as-read/${conversationId}`, {});
  }

  // Para actualizaciones en tiempo real
  onNewMessage(): Observable<any> {
    return this.newMessageSubject.asObservable();
  }

  // Simular mensaje entrante (en producción usaría WebSockets)
  simulateIncomingMessage(message: any) {
    this.newMessageSubject.next(message);
  }
}
