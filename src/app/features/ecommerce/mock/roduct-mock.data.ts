import { OnlineProduct } from '../../../core/models';

// MOCK DATA COMENTADO - Usando apenas dados reais da API
// export const MOCK_PRODUCTS: Product[] = [
//   {
//     id: '1',
//     name: 'Vestido Floral Primavera',
//     description: 'Vestido leve e elegante com estampa floral exclusiva. Perfeito para ocasiões especiais.',
//     image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=400&h=400',
//     imageAlt: 'Vestido Floral',
//     price: 189.90,
//     oldPrice: 249.90,
//     discountPercent: 24,
//     rating: {
//       average: 4.2,
//       count: 42,
//       stars: 4
//     },
//     badges: [
//       { type: BadgeType.NEW, label: 'Novo' },
//       { type: BadgeType.FEATURED, label: 'Destaque' }
//     ],
//     category: 'Vestidos',
//     inStock: true,
//     featured: true
//   },
//   {
//     id: '2',
//     name: 'Tênis Casual Urbano',
//     description: 'Tênis confortável para uso diário com design moderno e elegante.',
//     image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400&h=400',
//     imageAlt: 'Tênis Casual',
//     price: 139.90,
//     oldPrice: 199.90,
//     discountPercent: 30,
//     rating: {
//       average: 4.8,
//       count: 89,
//       stars: 5
//     },
//     badges: [
//       { type: BadgeType.SALE, label: '-30%' }
//     ],
//     category: 'Calçados',
//     inStock: true,
//     featured: false
//   },
//   {
//     id: '3',
//     name: 'Blusa Social Elegante',
//     description: 'Blusa versátil para looks profissionais e casuais.',
//     image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=400&h=400',
//     imageAlt: 'Blusa Elegante',
//     price: 89.90,
//     rating: {
//       average: 4.1,
//       count: 23,
//       stars: 4
//     },
//     badges: [],
//     category: 'Blusas',
//     inStock: true,
//     featured: false
//   },
//   {
//     id: '4',
//     name: 'Bolsa de Couro Premium',
//     description: 'Bolsa artesanal em couro legítimo com acabamento premium.',
//     image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400&h=400',
//     imageAlt: 'Bolsa de Couro',
//     price: 299.90,
//     rating: {
//       average: 4.9,
//       count: 67,
//       stars: 5
//     },
//     badges: [
//       { type: BadgeType.NEW, label: 'Novo' }
//     ],
//     category: 'Acessórios',
//     inStock: true,
//     featured: true
//   }
// ];

// Exemplo de uso no componente pai:
// export const EXAMPLE_USAGE = `
// // No template do componente pai:
// <app-storefront-item-card 
//   [product]="product"
//   [layout]="layoutType"
//   [showActions]="true"
//   [showRating]="true"
//   [showDescription]="true"
//   (addToCart)="onAddToCart($event)"
//   (favorite)="onFavorite($event)"
//   (compare)="onCompare($event)"
//   (quickView)="onQuickView($event)"
//   (productClick)="onProductClick($event)">
// </app-storefront-item-card>
// 
// // No componente pai:
// export class ParentComponent {
//   products = MOCK_PRODUCTS;
//   layoutType = LayoutType.GRID;
// 
//   onAddToCart(product: Product) {
//     console.log('Produto adicionado ao carrinho:', product);
//   }
// 
//   onFavorite(product: Product) {
//     console.log('Produto favoritado:', product);
//   }
// 
//   onCompare(product: Product) {
//     console.log('Produto para comparação:', product);
//   }
// 
//   onQuickView(product: Product) {
//     console.log('Visualização rápida:', product);
//   }
// 
//   onProductClick(product: Product) {
//     console.log('Produto clicado:', product);
//     // Navegar para página do produto
//   }
// }
// `;