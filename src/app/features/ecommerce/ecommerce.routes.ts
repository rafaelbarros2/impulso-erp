import { Routes } from '@angular/router';
import { OnlineProductListPageComponent } from './pages/online-product-list-page/online-product-list-page.component';
import { OnlineProductFormComponent } from './components/online-product-form/online-product-form.component';
import { StorefrontPageComponent } from './pages/storefront-page/storefront-page.component'; // Importar novo componente

export const ECOMMERCE_ROUTES: Routes = [
  { path: '', redirectTo: 'store', pathMatch: 'full' }, // Redireciona /ecommerce para /ecommerce/store
  { path: 'store', component: StorefrontPageComponent, title: 'Loja Online' }, // Nova rota para a loja
  { path: 'products', component: OnlineProductListPageComponent, title: 'Produtos Online (Admin)' }, // Renomeado para clareza
  { path: 'products/new', component: OnlineProductFormComponent, title: 'Novo Produto Online (Admin)' },
  { path: 'products/edit/:id', component: OnlineProductFormComponent, title: 'Editar Produto Online (Admin)' },
  // Você pode adicionar rotas para Configurações da Loja, Pedidos Online, etc., mais tarde no MVP ou pós-MVP
];
