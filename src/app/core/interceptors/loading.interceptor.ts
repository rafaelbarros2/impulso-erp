import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoadingService } from 'shared-lib';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private readonly globalLoadingUrls = new Set([
    '/api/users/login',
    '/api/users/logout',
    '/api/initial-data',
    '/api/configuration'
  ]);

  private readonly skipLoadingUrls = new Set([
    '/api/health',
    '/api/ping',
    '/api/heartbeat'
  ]);

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading for certain URLs
    if (this.shouldSkipLoading(request.url)) {
      return next.handle(request);
    }

    const loadingKey = this.getLoadingKey(request);
    
    // Start loading
    this.loadingService.setLoading(loadingKey, true);

    return next.handle(request).pipe(
      tap(event => {
        // Optional: Handle specific response events if needed
        if (event instanceof HttpResponse) {
          // Request completed successfully
        }
      }),
      finalize(() => {
        // Always stop loading when request completes (success or error)
        this.loadingService.setLoading(loadingKey, false);
      })
    );
  }

  private shouldSkipLoading(url: string): boolean {
    return Array.from(this.skipLoadingUrls).some(skipUrl => url.includes(skipUrl));
  }

  private getLoadingKey(request: HttpRequest<any>): string {
    const url = request.url;
    const method = request.method;

    // Use global loading for specific endpoints
    if (Array.from(this.globalLoadingUrls).some(globalUrl => url.includes(globalUrl))) {
      return LoadingService.KEYS.GLOBAL;
    }

    // Generate specific loading keys based on URL patterns
    if (url.includes('/api/products')) {
      if (method === 'GET' && !url.includes('/search')) {
        return LoadingService.KEYS.PRODUCTS;
      } else if (method === 'POST') {
        return LoadingService.KEYS.CREATING_PRODUCT;
      } else if (method === 'PUT') {
        return LoadingService.KEYS.UPDATING_PRODUCT;
      } else if (method === 'DELETE') {
        return LoadingService.KEYS.DELETING_PRODUCT;
      } else if (url.includes('/search')) {
        return LoadingService.KEYS.SEARCH;
      }
    }

    if (url.includes('/api/clients')) {
      if (method === 'GET') {
        return LoadingService.KEYS.CLIENTS;
      } else if (method === 'POST') {
        return LoadingService.KEYS.CREATING_CLIENT;
      } else if (method === 'PUT') {
        return LoadingService.KEYS.UPDATING_CLIENT;
      } else if (method === 'DELETE') {
        return LoadingService.KEYS.DELETING_CLIENT;
      }
    }

    if (url.includes('/api/orders')) {
      if (method === 'GET') {
        return LoadingService.KEYS.ORDERS;
      } else if (method === 'POST') {
        return LoadingService.KEYS.CHECKOUT;
      } else if (method === 'PUT') {
        return LoadingService.KEYS.UPDATING_CLIENT; // Reuse for order updates
      }
    }

    if (url.includes('/api/cart')) {
      if (method === 'POST') {
        return LoadingService.KEYS.ADD_TO_CART;
      } else if (method === 'PUT') {
        return LoadingService.KEYS.UPDATE_CART;
      } else if (method === 'DELETE') {
        return LoadingService.KEYS.REMOVE_FROM_CART;
      }
    }

    if (url.includes('/api/dashboard')) {
      return LoadingService.KEYS.DASHBOARD;
    }

    if (url.includes('/api/upload')) {
      return LoadingService.KEYS.UPLOAD;
    }

    if (url.includes('/api/download')) {
      return LoadingService.KEYS.DOWNLOAD;
    }

    // For form submissions, use a generic form submit key
    if (method === 'POST' || method === 'PUT') {
      return LoadingService.KEYS.FORM_SUBMIT;
    }

    // Default loading key for other requests
    return `http-${method.toLowerCase()}-${this.generateUrlKey(url)}`;
  }

  private generateUrlKey(url: string): string {
    // Create a simple key from the URL path
    try {
      const urlObj = new URL(url, window.location.origin);
      const path = urlObj.pathname;
      
      // Remove /api prefix and clean up
      const cleanPath = path.replace(/^\/api/, '').replace(/\//g, '-').replace(/^-/, '');
      
      // Remove dynamic IDs (UUIDs, numbers)
      const keyPath = cleanPath.replace(/-[a-f0-9-]{36}/gi, '-id')
                               .replace(/-\d+/g, '-id')
                               .replace(/-+/g, '-')
                               .replace(/^-|-$/g, '');
      
      return keyPath || 'request';
    } catch {
      return 'request';
    }
  }
}