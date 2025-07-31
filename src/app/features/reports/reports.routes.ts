import { Routes } from '@angular/router';
import { FinancialDashboardPageComponent } from './pages/financial-dashboard-page/financial-dashboard-page.component';

export const REPORTS_ROUTES: Routes = [
  { path: '', redirectTo: 'financial-dashboard', pathMatch: 'full' },
  { path: 'financial-dashboard', component: FinancialDashboardPageComponent, title: 'Dashboard Financeiro' },
  // Você pode adicionar rotas para outros relatórios (vendas, estoque, etc.) mais tarde no MVP ou pós-MVP
];
