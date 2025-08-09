import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { PosPageComponent } from './features/sales/pages/pos-page/pos-page.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login-page/login-page.component').then(m => m.LoginPageComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent)
      },
      {
        path: 'sales',
        children: [
          { path: '', redirectTo: 'pos', pathMatch: 'full' },
          { path: 'pos', component: PosPageComponent, title: 'Ponto de Venda (PDV)' },
          { path: 'online', loadComponent: () => import('./features/sales/pages/sales-page/sales-page.component').then(m => m.SalesPageComponent), title: 'Vendas Online' },
        ]
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/pages/settings-page/settings-page.component').then(m => m.SettingsPageComponent)
      },
      {
        path: 'stock',
        loadChildren: () => import('./features/stock/stock.routes').then(m => m.STOCK_ROUTES)
      },
      {
        path: 'clients',
        loadChildren: () => import('./features/clients/clients.routes').then(m => m.CLIENTS_ROUTES)
      },
      {
        path: 'finance', // Nova rota para o módulo financeiro
        loadChildren: () => import('./features/finance/finance.routes').then(m => m.FINANCE_ROUTES)
      }, 
      {
        path: 'reports', // Nova rota para o módulo de relatórios
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      },
    ]
  },
  { path: '**', redirectTo: 'dashboard' } // Redireciona rotas não encontradas
];
