import { Routes } from '@angular/router';
import { OnlineProductListPageComponent } from './pages/online-product-list-page/online-product-list-page.component';
import { OnlineProductFormComponent } from './components/online-product-form/online-product-form.component';
import { StorefrontPageComponent } from './pages/storefront-page/storefront-page.component';
import { OrderListPageComponent } from './pages/order-list-page/order-list-page.component';
import { CartPageComponent } from './pages/cart-page/cart-page.component'; // Importar o novo componente do carrinho

export const ECOMMERCE_ROUTES: Routes = [
  { path: '', redirectTo: 'store', pathMatch: 'full' },
  { path: 'store', component: StorefrontPageComponent, title: 'Loja Online' },
  { path: 'products', component: OnlineProductListPageComponent, title: 'Produtos Online (Admin)' },
  { path: 'products/new', component: OnlineProductFormComponent, title: 'Novo Produto Online (Admin)' },
  { path: 'products/edit/:id', component: OnlineProductFormComponent, title: 'Editar Produto Online (Admin)' },
  { path: 'orders', component: OrderListPageComponent, title: 'Pedidos Online' },
  { path: 'checkout', component: CartPageComponent, title: 'Meu Carrinho' }, // Nova rota para o carrinho
];
