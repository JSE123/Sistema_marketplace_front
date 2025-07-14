import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AuthService } from '../../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  // Api url
  private apiUrl = 'http://localhost:8080/api/messages';

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
