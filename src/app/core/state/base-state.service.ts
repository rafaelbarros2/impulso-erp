import { Injectable, signal, computed, effect, WritableSignal } from '@angular/core';
import { BaseState } from '../models';

export abstract class BaseStateService<TState extends BaseState> {
  protected abstract state: WritableSignal<TState>;
  
  // Common computed signals
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly lastUpdated = computed(() => this.state().lastUpdated);
  readonly hasError = computed(() => this.state().error !== null);
  
  // Common actions
  protected setLoading(loading: boolean): void {
    this.state.update((state: TState) => ({ ...state, loading }));
  }
  
  protected setError(error: string | null): void {
    this.state.update((state: TState) => ({ 
      ...state, 
      error, 
      loading: false,
      lastUpdated: error ? state.lastUpdated : new Date()
    }));
  }
  
  protected clearError(): void {
    this.state.update((state: TState) => ({ ...state, error: null }));
  }
  
  protected updateLastUpdated(): void {
    this.state.update((state: TState) => ({ ...state, lastUpdated: new Date() }));
  }
  
  // Abstract methods to be implemented by child classes
  abstract reset(): void;
  abstract getStateSnapshot(): TState;
}