import { Routes } from '@angular/router';
import { SettingsPageComponent } from './features/settings/pages/settings-page/settings-page.component';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'settings', pathMatch: 'full' },
      { path: 'settings', component: SettingsPageComponent },
      // Outras rotas (Vendas, Clientes, etc.) serão adicionadas aqui no futuro
    ],
  },
];