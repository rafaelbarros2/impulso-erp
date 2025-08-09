import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() onToggle = new EventEmitter<void>();

  iconMenu = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
  iconX = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  menuItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'pi-home' },
    { label: 'Vendas', route: '/sales', icon: 'pi-shopping-cart' },
    { label: 'Clientes', route: '/clients', icon: 'pi-users' },
    { label: 'Estoque', route: '/stock', icon: 'pi-box' },
    { label: 'Financeiro', route: '/finance', icon: 'pi-wallet' },
    { label: 'Relatórios', route: '/reports', icon: 'pi-chart-bar' },
    { label: 'Configurações', route: '/settings', icon: 'pi-cog' }
  ];

  toggle() {
    this.onToggle.emit();
  }
}