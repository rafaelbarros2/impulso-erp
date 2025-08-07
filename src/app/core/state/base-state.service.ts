import { Injectable, signal, computed, effect } from '@angular/core';
import { BaseState, StateOperations } from '../models';

export abstract class BaseStateService<TState extends BaseState> {
  protected abstract state: signal<TState>;
  
  // Common computed signals
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly lastUpdated = computed(() => this.state().lastUpdated);
  readonly hasError = computed(() => this.state().error !== null);
  
  // Common actions
  protected setLoading(loading: boolean): void {
    this.state.update(state => ({ ...state, loading }));
  }
  
  protected setError(error: string | null): void {
    this.state.update(state => ({ 
      ...state, 
      error, 
      loading: false,
      lastUpdated: error ? state.lastUpdated : new Date()
    }));
  }
  
  protected clearError(): void {
    this.state.update(state => ({ ...state, error: null }));
  }
  
  protected updateLastUpdated(): void {
    this.state.update(state => ({ ...state, lastUpdated: new Date() }));
  }
  
  // Abstract methods to be implemented by child classes
  abstract reset(): void;
  abstract getStateSnapshot(): TState;
}