import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
// import { authGuard } from './core/guards/auth.guard';
import { PosPageComponent } from './features/sales/pages/pos-page/pos-page.component'; // Importe o novo componente

export const routes: Routes = [
  // {
  //   path: 'login',
  //   loadComponent: () => import('./features/auth/pages/login-page/login-page.component').then(m => m.LoginPageComponent)
  // },
  {
    path: '',
    component: LayoutComponent,
    // canActivate: [authGuard], // Protege as rotas filhas
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent)
      },
      {
        path: 'sales',
        // Mantemos a rota 'sales' como pai e adicionamos as sub-rotas
        children: [
          { path: '', redirectTo: 'pos', pathMatch: 'full' }, // Redireciona /sales para /sales/pos
          { path: 'pos', component: PosPageComponent, title: 'Ponto de Venda (PDV)' }, // Nova rota do PDV
          { path: 'online', loadComponent: () => import('./features/sales/pages/sales-page/sales-page.component').then(m => m.SalesPageComponent), title: 'Vendas Online' }, // Exemplo de outra sub-rota
          // Adicione outras sub-rotas de vendas aqui (Histórico, Comissões, etc.)
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
      // Adicione outras rotas de módulo aqui conforme necessário para o MVP
    ]
  },
  { path: '**', redirectTo: 'dashboard' } // Redireciona rotas não encontradas
];
