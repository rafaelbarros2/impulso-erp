import { Routes } from '@angular/router';
import { ClientListPageComponent } from './pages/client-list-page/client-list-page.component';
import { ClientFormComponent } from './components/client-form/client-form.component';

export const CLIENTS_ROUTES: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: ClientListPageComponent, title: 'Lista de Clientes' },
  { path: 'new', component: ClientFormComponent, title: 'Novo Cliente' },
  { path: 'edit/:id', component: ClientFormComponent, title: 'Editar Cliente' },
];
