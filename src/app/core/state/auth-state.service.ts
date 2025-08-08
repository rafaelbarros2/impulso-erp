import { Injectable, computed, signal } from '@angular/core';
import { StateManagerService } from './state-manager.service';
import { BaseStateService } from './base-state.service';
import { 
  AuthState, 
  User, 
  Role, 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService extends BaseStateService<AuthState> {
  protected state = signal<AuthState>({
    loading: false,
    error: null,
    lastUpdated: null,
    isAuthenticated: false,
    user: null,
    token: null,
    permissions: [],
    roles: []
  });

  constructor(private stateManager: StateManagerService) {
    super();
  }

  // Computed signals
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly user = computed(() => this.state().user);
  readonly token = computed(() => this.state().token);
  readonly permissions = computed(() => this.state().permissions);
  readonly hasPermission = (permission: string) => computed(() => 
    this.state().permissions.includes(permission)
  );

  // Actions
  login(user: User, token: string, permissions: string[], roles: Role[] = []): void {
    this.setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      this.state.update(state => ({
        ...state,
        isAuthenticated: true,
        user,
        token,
        permissions,
        roles,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }));

      // Update global state
      this.stateManager.login(user, token, permissions);
    }, 500);
  }

  logout(): void {
    this.state.update(state => ({
      ...state,
      isAuthenticated: false,
      user: null,
      token: null,
      permissions: [],
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.logout();
  }

  setToken(token: string): void {
    this.state.update(state => ({
      ...state,
      token,
      lastUpdated: new Date()
    }));
  }

  setUser(user: User): void {
    this.state.update(state => ({
      ...state,
      user,
      isAuthenticated: true,
      lastUpdated: new Date()
    }));
  }

  setPermissions(permissions: string[]): void {
    this.state.update(state => ({
      ...state,
      permissions,
      lastUpdated: new Date()
    }));
  }

  hasPermissions(requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => 
      this.state().permissions.includes(permission)
    );
  }

  reset(): void {
    this.state.set({
      loading: false,
      error: null,
      lastUpdated: null,
      isAuthenticated: false,
      user: null,
      token: null,
      permissions: [],
      roles: []
    });
  }

  getStateSnapshot(): AuthState {
    return this.state();
  }

  getCurrentUser(): User | null {
    return this.state().user;
  }
}