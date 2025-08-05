import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';
import { environment } from '../../../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ProfileServiceService {


  //  private apiUrl = `${environment.apiUrl}/profile`;
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUserProfile(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getUserProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }

  getUserReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reviews`);
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}`, profileData);
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings`, settings);
  }

  deactivateAccount(): Observable<any> {
    return this.http.post(`${this.apiUrl}/deactivate`, {});
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}`);
  }

  updatePortada(portada: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', portada);
    return this.http.post(`${this.apiUrl}${this.authService.getCurrentUserId()}/portada`, formData);
  }

  updateAvatar(avatar: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', avatar);
    return this.http.post(`${this.apiUrl}${this.authService.getCurrentUserId()}/avatar`, formData);
  }

  getUserAssessment(userId: string): Observable<any> {
    
    return this.http.get(`http://localhost:8080/api/reputation/user-assessment/${userId}`);
  }
}
