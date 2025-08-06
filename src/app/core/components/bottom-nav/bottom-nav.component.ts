import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bottom-nav',
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss'
})
export class BottomNavComponent {
  mobileMenuItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'pi-home' },
    { label: 'Vendas', route: '/sales', icon: 'pi-shopping-cart' },
    { label: 'Clientes', route: '/clients', icon: 'pi-users' },
    { label: 'Estoque', route: '/stock', icon: 'pi-box' },
    { label: 'Financeiro', route: '/finance', icon: 'pi-wallet' },
    { label: 'Relatórios', route: '/reports', icon: 'pi-chart-bar' },
    { label: 'E-commerce', route: '/ecommerce', icon: 'pi-globe' },
    { label: 'Configurações', route: '/settings', icon: 'pi-cog' }
  ];
}
