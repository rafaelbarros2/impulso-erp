import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DynamicStylesService } from '../../services/dynamic-styles.service';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  action?: string;
  children?: MenuItem[];
  active?: boolean;
  disabled?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-dynamic-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="menu navigation" 
         [attr.data-dynamic-styles]="dynamicStylesService.isStylesLoaded()">
      
      <!-- Logo -->
      <div class="logo" *ngIf="showLogo">
        <img *ngIf="logoImage" [src]="logoImage" [alt]="logoText" class="logo-image">
        <span *ngIf="logoText && !logoImage" class="logo-text">{{ logoText }}</span>
      </div>

      <!-- Menu Items -->
      <div class="menu-items" [class]="menuItemsClass">
        <ng-container *ngFor="let item of menuItems; trackBy: trackByItemId">
          
          <!-- Link com roteamento -->
          <a *ngIf="item.url && !item.children?.length" 
             [routerLink]="item.url"
             routerLinkActive="active"
             class="menu-item nav-item"
             [class.disabled]="item.disabled"
             (click)="onItemClick(item, $event)">
            
            <i *ngIf="item.icon" [class]="getIconClass(item.icon)"></i>
            <span class="menu-label">{{ item.label }}</span>
            <span *ngIf="item.badge" class="menu-badge">{{ item.badge }}</span>
          </a>

          <!-- Botão com ação -->
          <button *ngIf="!item.url && !item.children?.length" 
                  type="button"
                  class="menu-item nav-item"
                  [class.active]="item.active"
                  [class.disabled]="item.disabled"
                  [disabled]="item.disabled"
                  (click)="onItemClick(item, $event)">
            
            <i *ngIf="item.icon" [class]="getIconClass(item.icon)"></i>
            <span class="menu-label">{{ item.label }}</span>
            <span *ngIf="item.badge" class="menu-badge">{{ item.badge }}</span>
          </button>

          <!-- Dropdown/Submenu -->
          <div *ngIf="item.children?.length" class="menu-dropdown">
            <button type="button" 
                    class="menu-item nav-item dropdown-toggle"
                    [class.active]="item.active || isChildActive(item)"
                    (click)="toggleDropdown(item.id)">
              
              <i *ngIf="item.icon" [class]="getIconClass(item.icon)"></i>
              <span class="menu-label">{{ item.label }}</span>
              <i class="pi pi-chevron-down dropdown-icon" 
                 [class.rotated]="isDropdownOpen(item.id)"></i>
            </button>

            <div class="dropdown-content" 
                 [class.open]="isDropdownOpen(item.id)"
                 [style.display]="isDropdownOpen(item.id) ? 'block' : 'none'">
              
              <ng-container *ngFor="let child of item.children">
                <a *ngIf="child.url" 
                   [routerLink]="child.url"
                   routerLinkActive="active"
                   class="dropdown-item"
                   [class.disabled]="child.disabled"
                   (click)="onItemClick(child, $event)">
                  
                  <i *ngIf="child.icon" [class]="getIconClass(child.icon)"></i>
                  <span>{{ child.label }}</span>
                  <span *ngIf="child.badge" class="menu-badge">{{ child.badge }}</span>
                </a>

                <button *ngIf="!child.url" 
                        type="button"
                        class="dropdown-item"
                        [class.active]="child.active"
                        [class.disabled]="child.disabled"
                        [disabled]="child.disabled"
                        (click)="onItemClick(child, $event)">
                  
                  <i *ngIf="child.icon" [class]="getIconClass(child.icon)"></i>
                  <span>{{ child.label }}</span>
                  <span *ngIf="child.badge" class="menu-badge">{{ child.badge }}</span>
                </button>
              </ng-container>
            </div>
          </div>

        </ng-container>
      </div>

      <!-- Menu de usuário -->
      <div class="user-menu" *ngIf="showUserMenu">
        <button type="button" class="user-avatar" (click)="toggleUserDropdown()">
          <img *ngIf="userAvatar" [src]="userAvatar" [alt]="userName" class="avatar-image">
          <i *ngIf="!userAvatar" class="pi pi-user"></i>
          <span *ngIf="userName" class="user-name">{{ userName }}</span>
          <i class="pi pi-chevron-down"></i>
        </button>

        <div class="user-dropdown" [class.open]="isUserDropdownOpen">
          <ng-content select="[slot=user-menu]"></ng-content>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .menu {
      /* Estilos base - serão sobrescritos pelos estilos dinâmicos */
      background: var(--menu-background, #ffffff);
      border-bottom: 1px solid var(--menu-border, #e2e8f0);
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-image {
      max-height: 40px;
      width: auto;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--logo-color, #1e293b);
    }

    .menu-items {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
      color: var(--menu-item-color, #374151);
      position: relative;
    }

    .menu-item:hover {
      background: var(--menu-item-hover-background, #f3f4f6);
      color: var(--menu-item-hover-color, #1f2937);
    }

    .menu-item.active {
      background: var(--menu-item-active-background, #3b82f6);
      color: var(--menu-item-active-color, #ffffff);
    }

    .menu-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .menu-badge {
      background: #ef4444;
      color: white;
      font-size: 0.75rem;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      min-width: 1.25rem;
      text-align: center;
      line-height: 1;
    }

    .menu-dropdown {
      position: relative;
    }

    .dropdown-toggle {
      position: relative;
    }

    .dropdown-icon {
      margin-left: 0.25rem;
      font-size: 0.75rem;
      transition: transform 0.2s ease;
    }

    .dropdown-icon.rotated {
      transform: rotate(180deg);
    }

    .dropdown-content {
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 50;
      min-width: 12rem;
      padding: 0.5rem 0;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-0.5rem);
      transition: all 0.2s ease;
    }

    .dropdown-content.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      color: #374151;
      text-decoration: none;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .dropdown-item:hover {
      background: #f3f4f6;
    }

    .dropdown-item.active {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .user-menu {
      position: relative;
    }

    .user-avatar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: none;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .user-avatar:hover {
      background: #f3f4f6;
    }

    .avatar-image {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-name {
      font-size: 0.875rem;
      color: #374151;
    }

    .user-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 50;
      min-width: 12rem;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-0.5rem);
      transition: all 0.2s ease;
    }

    .user-dropdown.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .menu {
        flex-direction: column;
        gap: 1rem;
        padding: 0.5rem;
      }

      .menu-items {
        flex-direction: column;
        width: 100%;
      }

      .menu-item {
        width: 100%;
        justify-content: flex-start;
      }

      .dropdown-content {
        position: static;
        box-shadow: none;
        border: none;
        background: #f9fafb;
        margin-left: 1rem;
      }
    }
  `]
})
export class DynamicMenuComponent implements OnInit {
  @Input() menuItems: MenuItem[] = [];
  @Input() showLogo = true;
  @Input() logoImage?: string;
  @Input() logoText?: string;
  @Input() showUserMenu = true;
  @Input() userName?: string;
  @Input() userAvatar?: string;
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';

  @Output() itemClick = new EventEmitter<{ item: MenuItem, event: Event }>();
  @Output() logoClick = new EventEmitter<Event>();

  protected dynamicStylesService = inject(DynamicStylesService);

  private openDropdowns = new Set<string>();
  isUserDropdownOpen = false;

  ngOnInit() {
    // O serviço já carrega os estilos automaticamente
  }

  get menuItemsClass(): string {
    return this.layout === 'vertical' ? 'flex-col' : 'flex-row';
  }

  onItemClick(item: MenuItem, event: Event) {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    this.itemClick.emit({ item, event });

    if (item.action) {
      // Executar ação customizada se definida
      this.executeAction(item.action, item);
    }
  }

  toggleDropdown(itemId: string) {
    if (this.openDropdowns.has(itemId)) {
      this.openDropdowns.delete(itemId);
    } else {
      this.openDropdowns.add(itemId);
    }
  }

  isDropdownOpen(itemId: string): boolean {
    return this.openDropdowns.has(itemId);
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  isChildActive(item: MenuItem): boolean {
    return item.children?.some(child => child.active) || false;
  }

  getIconClass(icon: string): string {
    // Suporta diferentes famílias de ícones
    if (icon.startsWith('pi-')) {
      return `pi ${icon}`;
    } else if (icon.startsWith('fa-')) {
      return `fa ${icon}`;
    } else if (icon.includes(' ')) {
      return icon; // Classe completa já fornecida
    } else {
      return `pi pi-${icon}`; // Default PrimeIcons
    }
  }

  trackByItemId(index: number, item: MenuItem): string {
    return item.id;
  }

  private executeAction(action: string, item: MenuItem) {
    // Implementar ações customizadas baseado no string de ação
    switch (action) {
      case 'toggle-theme':
        // Implementar toggle de tema
        break;
      case 'toggle-sidebar':
        // Implementar toggle de sidebar
        break;
      case 'search':
        // Abrir modal de busca
        break;
      default:
        console.log('Action not implemented:', action, item);
    }
  }
}