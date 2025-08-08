import { Injectable, computed, signal } from '@angular/core';
import { StateManagerService } from './state-manager.service';
import { BaseStateService } from './base-state.service';
import { 
  UIStateExtended, 
  DEFAULT_UI_STATE_EXTENDED,
  Notification, 
  NotificationAction, 
  ThemeMode 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class UIStateService extends BaseStateService<UIStateExtended> {
  protected state = signal<UIStateExtended>({
    loading: false,
    error: null,
    lastUpdated: null,
    theme: 'light',
    sidebar: {
      isOpen: true,
      isCollapsed: false
    },
    loadingState: {
      global: false,
      components: {}
    },
    notifications: [],
    modals: {},
    preferences: {
      language: 'pt-BR',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      numberFormat: 'pt-BR',
      theme: 'light',
      sidebar: {
        defaultOpen: true,
        defaultCollapsed: false
      },
      notifications: {
        enabled: true,
        sound: true,
        desktop: true,
        autoClose: true,
        defaultDuration: 3000
      },
      table: {
        defaultPageSize: 10,
        denseMode: false,
        showBorders: true
      }
    },
    layout: {
      header: {
        fixed: true,
        height: 64
      },
      sidebar: {
        fixed: true,
        width: 280,
        collapsedWidth: 80
      },
      footer: {
        fixed: false,
        height: 48
      },
      content: {
        padding: 24
      }
    }
  });

  constructor(private stateManager: StateManagerService) {
    super();
    this.loadPreferences();
  }

  // Computed signals
  readonly theme = computed(() => this.state().theme);
  readonly sidebar = computed(() => this.state().sidebar);
  readonly notifications = computed(() => this.state().notifications);
  readonly modals = computed(() => this.state().modals);
  readonly preferences = computed(() => this.state().preferences);
  readonly globalLoading = computed(() => this.state().loadingState.global);
  readonly unreadNotifications = computed(() => 
    this.state().notifications.filter(n => !n.read)
  );

  // Theme actions
  setTheme(theme: 'light' | 'dark'): void {
    this.state.update(state => ({
      ...state,
      theme,
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setTheme(theme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }

  toggleTheme(): void {
    const newTheme = this.theme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  // Sidebar actions
  setSidebar(sidebar: Partial<UIStateExtended['sidebar']>): void {
    this.state.update(state => ({
      ...state,
      sidebar: { ...state.sidebar, ...sidebar },
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setSidebar(sidebar);
  }

  toggleSidebar(): void {
    this.setSidebar({ isOpen: !this.sidebar().isOpen });
  }

  toggleSidebarCollapse(): void {
    this.setSidebar({ isCollapsed: !this.sidebar().isCollapsed });
  }

  // Loading actions
  setGlobalLoading(loading: boolean): void {
    this.state.update(state => ({
      ...state,
      loadingState: {
        ...state.loadingState,
        global: loading
      },
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setGlobalLoading(loading);
  }

  setComponentLoading(component: string, loading: boolean): void {
    this.state.update(state => ({
      ...state,
      loadingState: {
        ...state.loadingState,
        components: {
          ...state.loadingState.components,
          [component]: loading
        }
      },
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.setLoading(component, loading);
  }

  isComponentLoading(component: string): boolean {
    return this.state().loadingState.components[component] || false;
  }

  // Notification actions
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    this.state.update(state => ({
      ...state,
      notifications: [...state.notifications, newNotification],
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.addNotification(notification);

    // Auto-close if enabled
    if (notification.autoClose) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, duration);
    }
  }

  removeNotification(id: string): void {
    this.state.update(state => ({
      ...state,
      notifications: state.notifications.filter(n => n.id !== id),
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.removeNotification(id);
  }

  markNotificationAsRead(id: string): void {
    this.state.update(state => ({
      ...state,
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
      lastUpdated: new Date()
    }));

    // Update global state
    this.stateManager.markNotificationAsRead(id);
  }

  markAllNotificationsAsRead(): void {
    this.state.update(state => ({
      ...state,
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      lastUpdated: new Date()
    }));
  }

  clearNotifications(): void {
    this.state.update(state => ({
      ...state,
      notifications: [],
      lastUpdated: new Date()
    }));
  }

  // Modal actions
  openModal(modalId: string): void {
    this.state.update(state => ({
      ...state,
      modals: { ...state.modals, [modalId]: true },
      lastUpdated: new Date()
    }));
  }

  closeModal(modalId: string): void {
    this.state.update(state => ({
      ...state,
      modals: { ...state.modals, [modalId]: false },
      lastUpdated: new Date()
    }));
  }

  toggleModal(modalId: string): void {
    this.state.update(state => ({
      ...state,
      modals: { ...state.modals, [modalId]: !state.modals[modalId] },
      lastUpdated: new Date()
    }));
  }

  isModalOpen(modalId: string): boolean {
    return this.state().modals[modalId] || false;
  }

  // Preferences actions
  setPreferences(preferences: Partial<UIStateExtended['preferences']>): void {
    this.state.update(state => ({
      ...state,
      preferences: { ...state.preferences, ...preferences },
      lastUpdated: new Date()
    }));
    
    this.savePreferences();
  }

  private savePreferences(): void {
    const preferences = this.state().preferences;
    localStorage.setItem('ui-preferences', JSON.stringify(preferences));
  }

  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('ui-preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.setPreferences(preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  // Utility methods
  showSuccess(message: string, title?: string): void {
    this.addNotification({
      type: 'success',
      message,
      title,
      read: false,
      autoClose: true,
      duration: 3000
    });
  }

  showError(message: string, title?: string): void {
    this.addNotification({
      type: 'error',
      message,
      title,
      read: false,
      autoClose: false
    });
  }

  showWarning(message: string, title?: string): void {
    this.addNotification({
      type: 'warning',
      message,
      title,
      read: false,
      autoClose: true,
      duration: 5000
    });
  }

  showInfo(message: string, title?: string): void {
    this.addNotification({
      type: 'info',
      message,
      title,
      read: false,
      autoClose: true,
      duration: 4000
    });
  }

  reset(): void {
    this.state.set({
      loading: false,
      error: null,
      lastUpdated: null,
      theme: 'light',
      sidebar: {
        isOpen: true,
        isCollapsed: false
      },
      loadingState: {
        global: false,
        components: {}
      },
      notifications: [],
      modals: {},
      preferences: {
        language: 'pt-BR',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        numberFormat: 'pt-BR',
        theme: 'light',
        sidebar: {
          defaultOpen: true,
          defaultCollapsed: false
        },
        notifications: {
          enabled: true,
          sound: true,
          desktop: true,
          autoClose: true,
          defaultDuration: 3000
        },
        table: {
          defaultPageSize: 10,
          denseMode: false,
          showBorders: true
        }
      },
      layout: {
        header: {
          fixed: true,
          height: 64
        },
        sidebar: {
          fixed: true,
          width: 280,
          collapsedWidth: 80
        },
        footer: {
          fixed: false,
          height: 48
        },
        content: {
          padding: 24
        }
      }
    });
  }

  getStateSnapshot(): UIStateExtended {
    return this.state();
  }
}