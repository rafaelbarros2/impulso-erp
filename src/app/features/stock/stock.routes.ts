import { Routes } from '@angular/router';
import { ProductListPageComponent } from './pages/product-list-page/product-list-page.component';
import { ProductFormComponent } from './components/product-form/product-form.component';

export const STOCK_ROUTES: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductListPageComponent, title: 'Lista de Produtos' },
  { path: 'products/new', component: ProductFormComponent, title: 'Novo Produto' },
  { path: 'products/edit/:id', component: ProductFormComponent, title: 'Editar Produto' },
  // Você pode adicionar rotas para categorias, transferências, etc., mais tarde no MVP ou pós-MVP
];
