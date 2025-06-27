import { Injectable } from '@angular/core';
import {jwtDecode, JwtPayload} from 'jwt-decode';
import { CustomJwtPayload } from './CustomJwtPayload';
@Injectable({
  providedIn: 'root'
})
export class TokenService {

  

  constructor() { }

  decodeToken(token: string | null): CustomJwtPayload | null {
    if (token) {
      try {
        return jwtDecode<CustomJwtPayload>(token);
      } catch (error) {
        console.error('Error decoding token', error);
        return null;
      }
    }
    return null;
  }

  isTokenExpired(token?: string | null): boolean {
    const authToken = token || localStorage.getItem('token');
    if (!authToken) return true;
    
    const decoded = this.decodeToken(authToken);
    if (!decoded?.exp) return true;
    
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decoded.exp);
    return expirationDate.valueOf() < new Date().valueOf();
  }

  existsToken(): boolean {
    return !!localStorage.getItem('token'); 
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  
  
}


