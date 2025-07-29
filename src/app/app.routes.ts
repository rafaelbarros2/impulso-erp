import { Routes } from '@angular/router';
import { SettingsPageComponent } from './features/settings/pages/settings-page/settings-page.component';
import { LayoutComponent } from './core/layout/layout.component';
import { DashboardPageComponent } from './features/dashboard/pages/dashboard-page/dashboard-page.component';
import { SalesPageComponent } from './features/sales/pages/sales-page/sales-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'settings', component: SettingsPageComponent },
      { path: 'sales', component: SalesPageComponent },
            {
        path: 'stock', // Nova rota para o módulo de estoque
        loadChildren: () => import('./features/stock/stock.routes').then(m => m.STOCK_ROUTES)
      }, {
        path: 'clients', // Nova rota para o módulo de clientes
        loadChildren: () => import('./features/clients/clients.routes').then(m => m.CLIENTS_ROUTES)
      },
    ]
  },
];

