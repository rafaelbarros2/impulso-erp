import { Routes } from '@angular/router';
import { ReceivablesListPageComponent } from './pages/receivables-list-page/receivables-list-page.component';
import { ReceivableFormComponent } from './components/receivable-form/receivable-form.component';
import { PayablesListPageComponent } from './pages/payables-list-page/payables-list-page.component'; // Importar novo componente
import { PayableFormComponent } from './components/payable-form/payable-form.component'; // Importar novo componente

export const FINANCE_ROUTES: Routes = [
  { path: '', redirectTo: 'receivables', pathMatch: 'full' },
  { path: 'receivables', component: ReceivablesListPageComponent, title: 'Contas a Receber' },
  { path: 'receivables/new', component: ReceivableFormComponent, title: 'Novo Recebível' },
  { path: 'receivables/edit/:id', component: ReceivableFormComponent, title: 'Editar Recebível' },
  { path: 'payables', component: PayablesListPageComponent, title: 'Contas a Pagar' }, // Nova rota
  { path: 'payables/new', component: PayableFormComponent, title: 'Nova Conta a Pagar' }, // Nova rota
  { path: 'payables/edit/:id', component: PayableFormComponent, title: 'Editar Conta a Pagar' }, // Nova rota
  // Você pode adicionar rotas para Fluxo de Caixa, etc., mais tarde no MVP ou pós-MVP
];
