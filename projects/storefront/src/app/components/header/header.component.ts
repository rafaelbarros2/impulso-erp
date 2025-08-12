import { Component, HostListener } from '@angular/core';
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
        <nav class="main-nav">
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
          
          <!-- Cart - sempre visível -->
          <a routerLink="/cart" class="cart-btn">
            <i class="pi pi-shopping-cart"></i>
            <span class="cart-count">2</span>
          </a>

          <!-- Mobile menu toggle -->
          <button 
            class="mobile-menu-btn"
            (click)="toggleMobileMenu()"
            aria-label="Menu">
            <i class="pi" [ngClass]="mobileMenuOpen ? 'pi-times' : 'pi-bars'"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <nav 
        class="mobile-nav"
        [ngClass]="{'open': mobileMenuOpen}">
        <div class="mobile-nav-content">
          <!-- Busca Mobile -->
          <div class="mobile-search">
            <button class="mobile-search-btn" aria-label="Buscar produtos">
              <i class="pi pi-search"></i>
              <span>Buscar Produtos</span>
            </button>
          </div>
          
          <!-- Links de Navegação -->
          <div class="mobile-nav-links">
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
            <a routerLink="/promocoes" (click)="closeMobileMenu()" class="mobile-nav-link">
              <i class="pi pi-tags"></i>
              Promoções
            </a>
          </div>
        </div>
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
      width: 100%;
      overflow: hidden;
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
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }

    .cart-btn:hover {
      background: var(--primary-600);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
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
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease-in-out, opacity 0.3s ease;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      opacity: 0;
    }

    .mobile-nav.open {
      max-height: 500px;
      opacity: 1;
    }

    .mobile-nav-content {
      padding: 1rem;
    }

    .mobile-search {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--surface-200);
    }

    .mobile-search-btn {
      width: 100%;
      padding: 0.75rem;
      background: var(--surface-100);
      border: 1px solid var(--surface-300);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
      color: var(--text-color-secondary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .mobile-search-btn:hover {
      background: var(--surface-200);
      color: var(--text-color);
    }

    .mobile-nav-links {
      max-height: 60vh;
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 0.25rem;
    }

    /* Custom scrollbar */
    .mobile-nav-links::-webkit-scrollbar {
      width: 3px;
    }

    .mobile-nav-links::-webkit-scrollbar-track {
      background: var(--surface-100);
      border-radius: 2px;
    }

    .mobile-nav-links::-webkit-scrollbar-thumb {
      background: var(--surface-400);
      border-radius: 2px;
    }

    .mobile-nav-links::-webkit-scrollbar-thumb:hover {
      background: var(--surface-500);
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

    /* Garantir que o menu mobile apareça em telas pequenas */
    .mobile-nav {
      display: block;
    }

    @media (min-width: 769px) {
      .mobile-nav {
        display: none !important;
      }
    }

    @media (max-width: 768px) {
      .main-nav {
        display: none !important;
      }
      
      .mobile-menu-btn {
        display: flex !important;
      }
      
      .search-btn {
        display: none !important;
      }
    }

    /* Responsividade aprimorada */
    @media (max-width: 768px) {
      .header-container {
        padding: 0.75rem 1rem;
      }
      
      .logo-text {
        display: none;
      }
      
      .header-actions {
        gap: 0.5rem;
      }
      
      .search-btn,
      .mobile-menu-btn,
      .cart-btn {
        width: 36px;
        height: 36px;
      }
      
      .cart-count {
        font-size: 0.625rem;
        padding: 1px 4px;
        top: -4px;
        right: -4px;
      }
    }

    @media (max-width: 480px) {
      .header-container {
        padding: 0.5rem 0.75rem;
        gap: 1rem;
      }
      
      .logo-link {
        font-size: 1.125rem;
      }
      
      .header-actions {
        gap: 0.5rem;
      }
      
      .search-btn,
      .mobile-menu-btn,
      .cart-btn {
        width: 32px;
        height: 32px;
      }
      
      .mobile-nav-content {
        padding: 0.75rem;
      }
      
      .mobile-search-btn {
        padding: 0.625rem;
        font-size: 0.85rem;
      }
      
      .mobile-nav-link {
        padding: 0.75rem 0;
        font-size: 0.9rem;
      }
      
      .mobile-nav-links {
        max-height: 55vh;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .header-container {
        max-width: 100%;
        padding: 1rem 1.5rem;
      }
      
      .main-nav {
        gap: 1.5rem;
      }
    }

    @media (min-width: 1025px) {
      .header-container {
        max-width: 1200px;
      }
    }
  `]
})
export class HeaderComponent {
  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    console.log('Mobile menu toggled:', this.mobileMenuOpen);
    // Evita scroll do body quando menu mobile está aberto
    if (this.mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  // Fecha menu mobile quando clica fora ou redimensiona a janela
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (window.innerWidth >= 768 && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const mobileMenuBtn = target.closest('.mobile-menu-btn');
    const mobileNav = target.closest('.mobile-nav');
    
    // Se clicou fora do botão e do menu, fecha o menu
    if (!mobileMenuBtn && !mobileNav && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }
}