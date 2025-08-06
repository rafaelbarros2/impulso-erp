import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  errorCode?: string;
  fieldErrors?: Array<{
    field: string;
    rejectedValue: any;
    message: string;
  }>;
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry(this.shouldRetry(request) ? 1 : 0),
      catchError((error: HttpErrorResponse) => {
        this.handleError(error, request);
        return throwError(() => error);
      })
    );
  }

  private shouldRetry(request: HttpRequest<any>): boolean {
    // Only retry GET requests and avoid retrying auth requests
    return request.method === 'GET' && 
           !request.url.includes('/users/login') && 
           !request.url.includes('/users/register');
  }

  private handleError(error: HttpErrorResponse, request: HttpRequest<any>): void {
    const apiError = this.parseApiError(error);
    
    // Don't show notifications for login requests to avoid double notifications
    const isAuthRequest = request.url.includes('/users/login') || 
                         request.url.includes('/users/register');

    switch (error.status) {
      case 400:
        this.handle400Error(apiError, isAuthRequest);
        break;
      case 401:
        this.handle401Error(apiError, isAuthRequest);
        break;
      case 403:
        this.handle403Error(apiError, isAuthRequest);
        break;
      case 404:
        this.handle404Error(apiError, isAuthRequest);
        break;
      case 409:
        this.handle409Error(apiError, isAuthRequest);
        break;
      case 422:
        this.handle422Error(apiError, isAuthRequest);
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        this.handle5xxError(apiError, isAuthRequest);
        break;
      case 0:
        this.handleNetworkError(isAuthRequest);
        break;
      default:
        this.handleUnknownError(error, isAuthRequest);
        break;
    }
  }

  private parseApiError(error: HttpErrorResponse): ApiErrorResponse | null {
    if (error.error && typeof error.error === 'object') {
      return error.error as ApiErrorResponse;
    }
    return null;
  }

  private handle400Error(apiError: ApiErrorResponse | null, isAuthRequest: boolean): void {
    if (isAuthRequest) return;

    if (apiError?.errorCode === 'VALIDATION_FAILED' && apiError.fieldErrors) {
      this.notificationService.handleFieldValidationErrors(
        apiError.fieldErrors.map(fe => ({ field: fe.field, message: fe.message }))
      );
    } else if (apiError?.errorCode === 'BAD_REQUEST') {
      this.notificationService.error(apiError.message || 'Dados inválidos fornecidos.');
    } else {
      this.notificationService.error('Requisição inválida. Verifique os dados e tente novamente.');
    }
  }

  private handle401Error(apiError: ApiErrorResponse | null, isAuthRequest: boolean): void {
    if (apiError?.errorCode === 'INVALID_CREDENTIALS' && isAuthRequest) {
      // Let login component handle this
      return;
    }

    // For other 401 errors, handle session expiry
    this.notificationService.handleAuthenticationError();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private handle403Error(apiError: ApiErrorResponse | null, isAuthRequest: boolean): void {
    if (isAuthRequest) return;
    
    if (apiError?.errorCode === 'ACCESS_DENIED') {
      this.notificationService.handleAccessDeniedError();
    } else {
      this.notificationService.error('Você não tem permissão para realizar esta ação.');
    }
  }

  private handle404Error(apiError: ApiErrorResponse | null, isAuthRequest: boolean): void {
    if (isAuthRequest) return;

    if (apiError?.errorCode === 'ENTITY_NOT_FOUND') {
      // Try to extract entity type from message
      const entityType = this.extractEntityTypeFromMessage(apiError.message);
      this.notificationService.handleEntityNotFoundError(entityType);
    } else {
      this.notificationService.error('Recurso não encontrado.');
    }
  }

  private handle409Error(apiError: ApiErrorResponse | null, isAuthRequest: boolean): void {
    if (isAuthRequest) return;

    if (apiError?.errorCode === 'INSUFFICIENT_STOCK') {
      this.notificationService.handleInsufficientStockError(apiError.message);
    } else {
      this.notificationService.error(apiError?.message || 'Conflito na operação solicitada.');
    }
  }

  private handle422Error(apiError: ApiErrorResponse | null, isAuthRequest: boolean): void {
    if (isAuthRequest) return;

    if (apiError?.fieldErrors) {
      this.notificationService.handleFieldValidationErrors(
        apiError.fieldErrors.map(fe => ({ field: fe.field, message: fe.message }))
      );
    } else {
      this.notificationService.error(apiError?.message || 'Dados fornecidos não podem ser processados.');
    }
  }

  private handle5xxError(apiError: ApiErrorResponse | null, isAuthRequest: boolean): void {
    if (isAuthRequest) return;
    
    this.notificationService.handleServerError();
  }

  private handleNetworkError(isAuthRequest: boolean): void {
    if (isAuthRequest) return;
    
    this.notificationService.handleNetworkError();
  }

  private handleUnknownError(error: HttpErrorResponse, isAuthRequest: boolean): void {
    if (isAuthRequest) return;
    
    console.error('Unknown error occurred:', error);
    this.notificationService.error(
      `Erro inesperado (${error.status}). Tente novamente ou contate o suporte.`
    );
  }

  private extractEntityTypeFromMessage(message: string): string {
    // Try to extract entity type from common message patterns
    const patterns = [
      /(\w+) with id .+ not found/i,
      /(\w+) not found/i,
      /(\w+) não encontrado/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return this.translateEntityType(match[1]);
      }
    }

    return 'Recurso';
  }

  private translateEntityType(entityType: string): string {
    const translations: Record<string, string> = {
      'Product': 'Produto',
      'User': 'Usuário',
      'Store': 'Loja',
      'Order': 'Pedido',
      'Client': 'Cliente',
      'ProductVariant': 'Variação do Produto',
      'Cart': 'Carrinho'
    };

    return translations[entityType] || entityType;
  }
}