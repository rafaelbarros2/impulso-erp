import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    resolve: { tenant: () => import('./resolvers/tenant.resolver').then(r => r.tenantResolver) },
    loadComponent: () => import('./pages/storefront-home/storefront-home.page').then(c => c.StorefrontHomePage)
  },
  {
    path: 'c/:slug',
    loadComponent: () => import('./pages/category/category.component').then(c => c.CategoryComponent),
    resolve: {
      category: () => import('./resolvers/category.resolver').then(r => r.categoryResolver)
    }
  },
  {
    path: 'p/:slug',
    loadComponent: () => import('./pages/product/product.component').then(c => c.ProductComponent),
    resolve: {
      product: () => import('./resolvers/product.resolver').then(r => r.productResolver)
    }
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(c => c.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(c => c.CheckoutComponent)
  },
  // ✅ NOVA ROTA (mantém os query params tipo ?pageUrl=...)
  {
    path: 'promocoes',
    loadComponent: () => import('./pages/promotion/promotion.component').then(c => c.PromotionComponent)
  },
  {
    path: 'promotion',
    loadComponent: () => import('./pages/promotion/promotion.component').then(c => c.PromotionComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
