import { Routes } from '@angular/router';
import { OnlineProductListPageComponent } from './pages/online-product-list-page/online-product-list-page.component';
import { OnlineProductFormComponent } from './components/online-product-form/online-product-form.component';
import { StorefrontPagePromotionComponent } from './pages/storefront-page-promotion/storefront-page-promotion.component';
import { OrderListPageComponent } from './pages/order-list-page/order-list-page.component';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';
import { CheckoutWhatsappPageComponent } from './pages/checkout-whatsapp-page/checkout-whatsapp-page.component'; // Importar o novo componente
import { StorefrontPageComponent } from './pages/storefront-page/storefront-page.component';

export const ECOMMERCE_ROUTES: Routes = [
  { path: '', redirectTo: 'promocoes', pathMatch: 'full' },
  { path: 'promocoes', component: StorefrontPagePromotionComponent, title: 'Loja Online' },
  { path: 'products', component: OnlineProductListPageComponent, title: 'Produtos Online (Admin)' },
  { path: 'products/new', component: OnlineProductFormComponent, title: 'Novo Produto Online (Admin)' },
  { path: 'products/edit/:id', component: OnlineProductFormComponent, title: 'Editar Produto Online (Admin)' },
  { path: 'orders', component: OrderListPageComponent, title: 'Pedidos Online' },
  { path: 'cart', component: CartPageComponent, title: 'Meu Carrinho' },
  { 
    path: 'checkout', 
    // Aqui a lógica do seu resolver (ou guarda de rota) vai decidir qual componente de checkout carregar
    // Para o MVP, podemos ter uma rota simples para o checkout padrão
    // e uma para o checkout do WhatsApp
    children: [
        { path: '', redirectTo: 'standard', pathMatch: 'full' },
        { path: 'standard', component: CheckoutPageComponent, title: 'Finalizar Compra' },
        { path: 'whatsapp', component: CheckoutWhatsappPageComponent, title: 'Finalizar Pedido WhatsApp' }
    ]
  },{
    path: 'store',component: StorefrontPageComponent, title: 'Loja Online'
  
  }
  

];