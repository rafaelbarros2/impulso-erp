import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent)
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
  {
    path: '**',
    redirectTo: ''
  }
];
