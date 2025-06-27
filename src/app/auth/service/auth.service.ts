import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { LoginRequest } from '../LoginRequest';
import { TokenService } from '../../core/Service/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth'; 
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  isAuthenticated$ = this.isLoggedInSubject.asObservable();

  private   _tokenService = inject(TokenService);


  constructor(private http: HttpClient) { }

  login(credentials: { username: string; password: string }): Observable<any> {
    console.log("credenciales", credentials);
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      map((res: any) => {
        localStorage.setItem('token', res.jwt);
        this.isLoggedInSubject.next(true);
        return res;
      })
    );
  }

  register(usuario: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sign-up`, usuario).pipe(
      tap(response => {
        if(response.status){
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
  }

  getUsername(): string | null {
    return this._tokenService.decodeToken(this.getToken())?.sub || null;
  }

  getCurrentUserId(): string | null {

    const decodedToken = this._tokenService.decodeToken(this.getToken());
    return decodedToken ? decodedToken.id : null;
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  getToken(): string | null {
    if(localStorage.getItem('token') == "undefined" || localStorage.getItem('token') == null){
      return null;
    }else{ 
      return localStorage.getItem('token');
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const decodedToken = this._tokenService.decodeToken(token);
    return decodedToken!.authorities.includes(role);
  }
    
}
