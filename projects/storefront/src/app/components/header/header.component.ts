import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  template: `
    <header class="storefront-header">
      <div class="header-container">
        <!-- Logo -->
        <div class="logo-section">
          <a routerLink="/" class="logo-link">
            <i class="pi pi-shopping-bag text-2xl text-primary"></i>
            <span class="logo-text">Storefront</span>
          </a>
        </div>

        <!-- Navigation -->
        <nav class="main-nav hidden md:flex">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            Início
          </a>
          <a routerLink="/c/electronics" routerLinkActive="active" class="nav-link">
            Eletrônicos
          </a>
          <a routerLink="/c/clothing" routerLinkActive="active" class="nav-link">
            Roupas
          </a>
          <a routerLink="/c/books" routerLinkActive="active" class="nav-link">
            Livros
          </a>
        </nav>

        <!-- Cart and Actions -->
        <div class="header-actions">
          <button 
            class="search-btn"
            aria-label="Buscar produtos">
            <i class="pi pi-search"></i>
          </button>
          
          <a routerLink="/cart" class="cart-btn">
            <i class="pi pi-shopping-cart"></i>
            <span class="cart-count">2</span>
          </a>

          <!-- Mobile menu toggle -->
          <button 
            class="mobile-menu-btn md:hidden"
            (click)="toggleMobileMenu()"
            aria-label="Menu">
            <i class="pi" [ngClass]="mobileMenuOpen ? 'pi-times' : 'pi-bars'"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <nav 
        class="mobile-nav md:hidden"
        [ngClass]="{'open': mobileMenuOpen}">
        <a routerLink="/" (click)="closeMobileMenu()" class="mobile-nav-link">
          <i class="pi pi-home"></i>
          Início
        </a>
        <a routerLink="/c/electronics" (click)="closeMobileMenu()" class="mobile-nav-link">
          <i class="pi pi-bolt"></i>
          Eletrônicos
        </a>
        <a routerLink="/c/clothing" (click)="closeMobileMenu()" class="mobile-nav-link">
          <i class="pi pi-user"></i>
          Roupas
        </a>
        <a routerLink="/c/books" (click)="closeMobileMenu()" class="mobile-nav-link">
          <i class="pi pi-book"></i>
          Livros
        </a>
      </nav>
    </header>
  `,
  styles: [`
    .storefront-header {
      background: white;
      border-bottom: 1px solid var(--surface-300);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .logo-section {
      flex-shrink: 0;
    }

    .logo-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--primary-color);
      font-weight: 700;
      font-size: 1.25rem;
    }

    .logo-text {
      color: var(--text-color);
    }

    .main-nav {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      text-decoration: none;
      color: var(--text-color-secondary);
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.2s;
      position: relative;
    }

    .nav-link:hover,
    .nav-link.active {
      color: var(--primary-color);
      background: var(--primary-50);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-shrink: 0;
    }

    .search-btn,
    .mobile-menu-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: var(--surface-100);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--text-color-secondary);
    }

    .search-btn:hover,
    .mobile-menu-btn:hover {
      background: var(--surface-200);
      color: var(--text-color);
    }

    .cart-btn {
      position: relative;
      width: 40px;
      height: 40px;
      background: var(--primary-color);
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      transition: all 0.2s;
    }

    .cart-btn:hover {
      background: var(--primary-600);
      transform: translateY(-1px);
    }

    .cart-count {
      position: absolute;
      top: -6px;
      right: -6px;
      background: var(--red-500);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      line-height: 1;
      min-width: 16px;
      text-align: center;
    }

    .mobile-nav {
      background: white;
      border-top: 1px solid var(--surface-300);
      padding: 1rem 2rem;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-in-out;
    }

    .mobile-nav.open {
      max-height: 300px;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      text-decoration: none;
      color: var(--text-color-secondary);
      font-weight: 500;
      border-bottom: 1px solid var(--surface-200);
      transition: color 0.2s;
    }

    .mobile-nav-link:last-child {
      border-bottom: none;
    }

    .mobile-nav-link:hover {
      color: var(--primary-color);
    }

    @media (max-width: 768px) {
      .header-container {
        padding: 1rem;
      }
      
      .logo-text {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}