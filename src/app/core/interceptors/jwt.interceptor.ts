import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from the service
    const token = this.authService.getToken();
    
    // Don't add token to login and register requests
    const isAuthRequest = request.url.includes('/users/login') || 
                         request.url.includes('/users/register') ||
                         request.url.includes('/stores/');

    if (token && !isAuthRequest) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If we get a 401 Unauthorized response, the token is invalid
        if (error.status === 401 && !isAuthRequest) {
          this.authService.logout();
        }
        
        return throwError(() => error);
      })
    );
  }
}