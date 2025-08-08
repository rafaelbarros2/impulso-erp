import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';
import { take } from 'rxjs/operators';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get loading state for a specific key', () => {
    const key = 'test-key';
    
    service.setLoading(key, true);
    expect(service.isLoading(key)).toBe(true);
    
    service.setLoading(key, false);
    expect(service.isLoading(key)).toBe(false);
  });

  it('should emit loading state changes', (done) => {
    const key = 'test-key';
    
    service.getLoadingState(key).pipe(take(1)).subscribe(isLoading => {
      expect(isLoading).toBe(false);
      
      service.setLoading(key, true);
      
      service.getLoadingState(key).pipe(take(1)).subscribe(isLoading => {
        expect(isLoading).toBe(true);
        done();
      });
    });
  });

  it('should return false for non-existent keys', () => {
    expect(service.isLoading('non-existent-key')).toBe(false);
  });

  it('should clear specific loading state', () => {
    const key = 'test-key';
    
    service.setLoading(key, true);
    expect(service.isLoading(key)).toBe(true);
    
    service.clearLoading(key);
    expect(service.isLoading(key)).toBe(false);
  });

  it('should clear all loading states', () => {
    service.setLoading('key1', true);
    service.setLoading('key2', true);
    service.setGlobalLoading(true);
    
    expect(service.isLoading('key1')).toBe(true);
    expect(service.isLoading('key2')).toBe(true);
    expect(service.isGlobalLoading()).toBe(true);
    
    service.clearAll();
    
    expect(service.isLoading('key1')).toBe(false);
    expect(service.isLoading('key2')).toBe(false);
    expect(service.isGlobalLoading()).toBe(false);
  });

  it('should handle global loading state', () => {
    service.setGlobalLoading(true);
    expect(service.isGlobalLoading()).toBe(true);
    
    service.setGlobalLoading(false);
    expect(service.isGlobalLoading()).toBe(false);
  });

  it('should detect any loading state', () => {
    expect(service.isAnyLoading()).toBe(false);
    
    service.setLoading('test-key', true);
    expect(service.isAnyLoading()).toBe(true);
    
    service.clearLoading('test-key');
    expect(service.isAnyLoading()).toBe(false);
    
    service.setGlobalLoading(true);
    expect(service.isAnyLoading()).toBe(true);
  });

  it('should start loading and return stop function', () => {
    const key = 'test-key';
    const stopLoading = service.startLoading(key);
    
    expect(service.isLoading(key)).toBe(true);
    
    stopLoading();
    expect(service.isLoading(key)).toBe(false);
  });

  it('should execute async operation with loading state', async () => {
    const key = 'test-key';
    const mockOperation = jest.fn().mockResolvedValue('result');
    
    expect(service.isLoading(key)).toBe(false);
    
    const resultPromise = service.withLoading(key, mockOperation);
    
    // Should be loading during operation
    expect(service.isLoading(key)).toBe(true);
    
    const result = await resultPromise;
    
    // Should not be loading after operation
    expect(service.isLoading(key)).toBe(false);
    expect(result).toBe('result');
    expect(mockOperation).toHaveBeenCalled();
  });

  it('should handle async operation errors and still clear loading', async () => {
    const key = 'test-key';
    const mockOperation = jest.fn().mockRejectedValue(new Error('Test error'));
    
    expect(service.isLoading(key)).toBe(false);
    
    try {
      await service.withLoading(key, mockOperation);
      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(service.isLoading(key)).toBe(false);
    }
  });

  it('should execute observable operation with loading state', (done) => {
    const key = 'test-key';
    const mockObservable = service.withLoadingObservable(key, service['simulateApiCall']());
    
    expect(service.isLoading(key)).toBe(true);
    
    mockObservable.subscribe({
      next: (result) => {
        expect(result).toBe('api-result');
      },
      complete: () => {
        expect(service.isLoading(key)).toBe(false);
        done();
      }
    });
  });

  it('should handle observable errors and still clear loading', (done) => {
    const key = 'test-key';
    const errorObservable = service.withLoadingObservable(key, service['simulateApiError']());
    
    expect(service.isLoading(key)).toBe(true);
    
    errorObservable.subscribe({
      error: (error) => {
        expect(error).toBeInstanceOf(Error);
        expect(service.isLoading(key)).toBe(false);
        done();
      }
    });
  });

  it('should remove loading key from state when set to false', () => {
    const key = 'test-key';
    
    service.setLoading(key, true);
    
    service.getLoadingStates().pipe(take(1)).subscribe(states => {
      expect(states[key]).toBe(true);
    });
    
    service.setLoading(key, false);
    
    service.getLoadingStates().pipe(take(1)).subscribe(states => {
      expect(states[key]).toBeUndefined();
    });
  });

  it('should have predefined loading keys', () => {
    expect(LoadingService.KEYS.GLOBAL).toBe('global');
    expect(LoadingService.KEYS.PRODUCTS).toBe('products');
    expect(LoadingService.KEYS.CLIENTS).toBe('clients');
    expect(LoadingService.KEYS.LOGIN).toBe('login');
    expect(LoadingService.KEYS.CREATING_PRODUCT).toBe('creating-product');
    expect(LoadingService.KEYS.DELETING_PRODUCT).toBe('deleting-product');
  });
});

// Helper functions for testing
function simulateApiCall() {
  return new Promise(resolve => {
    setTimeout(() => resolve('api-result'), 100);
  });
}

function simulateApiError() {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('API Error')), 100);
  });
}