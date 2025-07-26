import { inject,  Injectable } from '@angular/core';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs'; 
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
 
  private stompClient?: Client;
  private notificationSubject = new Subject<any>();
  private _http = inject(HttpClient);

  // Api url
  private apiUrl = 'http://localhost:8080/api/notifications';


//   constructor() { }


  connect(userId: number) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'), // endpoint backend
      reconnectDelay: 5000, // reconexión automática
      onConnect: () => {
        console.log('🟢 WebSocket conectado');

        // Te suscribes aquí dentro de onConnect
        this.stompClient?.subscribe(`/topic/notifications/${userId}`, (message: IMessage) => {
          const notification = JSON.parse(message.body);
          this.notificationSubject.next(notification);
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error: ', frame);
      }
    });

    this.stompClient.activate(); // Este es el nuevo método para iniciar conexiónf
  }

  getNotifications(): Observable<any> {
    return this.notificationSubject.asObservable();
  }

  disconnect() {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }

  getNotificationsByUserId(userId: string): Observable<any> {
    return this._http.get(`${this.apiUrl}/users/${userId}/notifications`); // Cambia la URL según tu API
  }

  markAllAsRead(userId: string): Observable<any> {
    console.log('Marcar todas las notificaciones como leídas para el usuario:', userId, ` ${this.apiUrl}/users/${userId}/mark-all-as-read`);
    return this._http.post(`${this.apiUrl}/users/${userId}/mark-all-as-read`, {}); // Cambia la URL según tu API
  }

}
