import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'impulso_token';
  private userKey = 'impulso_user';
  
  private currentUser = signal<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUser.asReadonly();
  
  private isAuthenticated = signal<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticated.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/users/login`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, userData);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  

  private setSession(authResult: LoginResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, authResult.token);
      localStorage.setItem(this.userKey, JSON.stringify(authResult.user));
      
      this.currentUser.set(authResult.user);
      this.isAuthenticated.set(true);
    }
  }

  private clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private getUserFromStorage(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        this.clearSession();
        return false;
      }
      
      return true;
    } catch (error) {
      this.clearSession();
      return false;
    }
  }

  refreshAuthState(): void {
    const isValid = this.hasValidToken();
    this.isAuthenticated.set(isValid);
    
    if (!isValid) {
      this.currentUser.set(null);
    }
  }
}