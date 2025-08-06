import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ErrorInterceptor } from './error.interceptor';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'error', 'warning', 'handleFieldValidationErrors', 'handleAuthenticationError',
      'handleAccessDeniedError', 'handleEntityNotFoundError', 'handleServerError',
      'handleNetworkError', 'handleInsufficientStockError'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: NotificationService, useValue: notificationSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should handle 400 Bad Request errors', () => {
    const testData = { message: 'Test error' };
    const errorResponse = {
      status: 400,
      error: 'VALIDATION_FAILED',
      message: 'Invalid input data',
      path: '/api/test',
      timestamp: new Date().toISOString(),
      errorCode: 'VALIDATION_FAILED',
      fieldErrors: [
        { field: 'name', rejectedValue: '', message: 'Name is required' }
      ]
    };

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 400 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });

    expect(notificationService.handleFieldValidationErrors).toHaveBeenCalledWith([
      { field: 'name', message: 'Name is required' }
    ]);
  });

  it('should handle 401 Unauthorized errors and logout user', () => {
    const errorResponse = {
      status: 401,
      error: 'AUTHENTICATION_FAILED',
      message: 'Authentication failed',
      path: '/api/protected',
      timestamp: new Date().toISOString(),
      errorCode: 'AUTHENTICATION_FAILED'
    };

    httpClient.get('/api/protected').subscribe({
      next: () => fail('should have failed with 401 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpTestingController.expectOne('/api/protected');
    req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });

    expect(notificationService.handleAuthenticationError).toHaveBeenCalled();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle 403 Forbidden errors', () => {
    const errorResponse = {
      status: 403,
      error: 'ACCESS_DENIED',
      message: 'Access denied',
      path: '/api/admin',
      timestamp: new Date().toISOString(),
      errorCode: 'ACCESS_DENIED'
    };

    httpClient.get('/api/admin').subscribe({
      next: () => fail('should have failed with 403 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(403);
      }
    });

    const req = httpTestingController.expectOne('/api/admin');
    req.flush(errorResponse, { status: 403, statusText: 'Forbidden' });

    expect(notificationService.handleAccessDeniedError).toHaveBeenCalled();
  });

  it('should handle 404 Not Found errors', () => {
    const errorResponse = {
      status: 404,
      error: 'ENTITY_NOT_FOUND',
      message: 'Product with id 123 not found',
      path: '/api/products/123',
      timestamp: new Date().toISOString(),
      errorCode: 'ENTITY_NOT_FOUND'
    };

    httpClient.get('/api/products/123').subscribe({
      next: () => fail('should have failed with 404 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
      }
    });

    const req = httpTestingController.expectOne('/api/products/123');
    req.flush(errorResponse, { status: 404, statusText: 'Not Found' });

    expect(notificationService.handleEntityNotFoundError).toHaveBeenCalledWith('Produto');
  });

  it('should handle 409 Conflict errors (insufficient stock)', () => {
    const errorResponse = {
      status: 409,
      error: 'INSUFFICIENT_STOCK',
      message: 'Insufficient stock for product Test Product. Requested: 5, Available: 2',
      path: '/api/cart/add',
      timestamp: new Date().toISOString(),
      errorCode: 'INSUFFICIENT_STOCK'
    };

    httpClient.post('/api/cart/add', {}).subscribe({
      next: () => fail('should have failed with 409 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(409);
      }
    });

    const req = httpTestingController.expectOne('/api/cart/add');
    req.flush(errorResponse, { status: 409, statusText: 'Conflict' });

    expect(notificationService.handleInsufficientStockError).toHaveBeenCalledWith(
      'Insufficient stock for product Test Product. Requested: 5, Available: 2'
    );
  });

  it('should handle 500 Internal Server Error', () => {
    const errorResponse = {
      status: 500,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      path: '/api/test',
      timestamp: new Date().toISOString(),
      errorCode: 'INTERNAL_SERVER_ERROR'
    };

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 500 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush(errorResponse, { status: 500, statusText: 'Internal Server Error' });

    expect(notificationService.handleServerError).toHaveBeenCalled();
  });

  it('should handle network errors (status 0)', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with network error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(0);
      }
    });

    const req = httpTestingController.expectOne('/api/test');
    req.error(new ProgressEvent('Network error'), { status: 0 });

    expect(notificationService.handleNetworkError).toHaveBeenCalled();
  });

  it('should not show notifications for auth requests', () => {
    const errorResponse = {
      status: 401,
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid credentials',
      path: '/api/users/login',
      timestamp: new Date().toISOString(),
      errorCode: 'INVALID_CREDENTIALS'
    };

    httpClient.post('/api/users/login', {}).subscribe({
      next: () => fail('should have failed with 401 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpTestingController.expectOne('/api/users/login');
    req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });

    // Should not call any notification methods for login requests
    expect(notificationService.handleAuthenticationError).not.toHaveBeenCalled();
    expect(authService.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should retry GET requests once', () => {
    let requestCount = 0;

    httpClient.get('/api/test').subscribe({
      next: (data) => {
        expect(data).toEqual({ message: 'success' });
        expect(requestCount).toBe(2); // Original + 1 retry
      },
      error: () => fail('should have succeeded on retry')
    });

    // First request - fails
    const req1 = httpTestingController.expectOne('/api/test');
    requestCount++;
    req1.error(new ProgressEvent('Network error'), { status: 0 });

    // Retry request - succeeds
    const req2 = httpTestingController.expectOne('/api/test');
    requestCount++;
    req2.flush({ message: 'success' });
  });

  it('should not retry POST requests', () => {
    let requestCount = 0;

    httpClient.post('/api/test', {}).subscribe({
      next: () => fail('should have failed'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(0);
        expect(requestCount).toBe(1); // No retry for POST
      }
    });

    const req = httpTestingController.expectOne('/api/test');
    requestCount++;
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });
});