import { Injectable, inject, Renderer2, RendererFactory2, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { Category, Product } from '../models/interfaces/catalog.interfaces';
import { SeoConfig } from '../models/interfaces/seo.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT) as Document;
  private platformId = inject(PLATFORM_ID);
  private rendererFactory = inject(RendererFactory2);
  private renderer: Renderer2;

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /**
   * Configura SEO completo para uma página
   */
  setSeoConfig(config: SeoConfig): void {
    this.setTitle(config.title);
    this.setDescription(config.description);
    
    if (config.keywords) {
      this.setKeywords(config.keywords);
    }
    
    if (config.canonical) {
      this.setCanonical(config.canonical);
    }
    
    this.setOpenGraphTags({
      title: config.ogTitle || config.title,
      description: config.ogDescription || config.description,
      image: config.ogImage,
      url: config.ogUrl,
      type: config.ogType || 'website'
    });
    
    this.setTwitterTags({
      card: config.twitterCard || 'summary_large_image',
      title: config.ogTitle || config.title,
      description: config.ogDescription || config.description,
      image: config.twitterImage || config.ogImage
    });
    
    if (config.structuredData) {
      this.addStructuredData(config.structuredData);
    }
  }

  /**
   * Configura SEO para página de categoria
   */
  setCategorySeo(category: Category, baseUrl: string): void {
    const count = Array.isArray((category as any)?.products) ? category.products.length : 0;
    const config: SeoConfig = {
      title: `${category.name} - Premium Products | Storefront`,
      description: category.description || `Explore our ${category.name.toLowerCase()} collection with ${count} premium products.`,
      keywords: `${category.name}, products, shopping, ecommerce`,
      canonical: `${baseUrl}/c/${category.slug}`,
      ogTitle: `${category.name} Collection`,
      ogDescription: category.description || `Discover ${count} amazing ${category.name.toLowerCase()} products`,
      ogImage: category.image,
      ogUrl: `${baseUrl}/c/${category.slug}`,
      ogType: 'website',
      structuredData: this.generateCategoryStructuredData(category, baseUrl)
    };
    
    this.setSeoConfig(config);
  }

  /**
   * Configura SEO para página de produto
   */
  setProductSeo(product: Product, baseUrl: string): void {
    const availability = product.inStock ? 'InStock' : 'OutOfStock';
    const discount = product.originalPrice ? 
      Math.round((1 - product.price / product.originalPrice) * 100) : 0;
    
    const config: SeoConfig = {
      title: `${product.name} - $${product.price} | Premium Storefront`,
      description: product.description || `${product.name} available for $${product.price}. ${product.inStock ? 'In stock' : 'Out of stock'}.`,
      keywords: `${product.name}, product, buy, shopping, ${((product.attributes || []).map(a => a.value).join(', '))}`,
      canonical: `${baseUrl}/p/${product.slug}`,
      ogTitle: product.name,
      ogDescription: `${product.name} - $${product.price}${discount > 0 ? ` (${discount}% off!)` : ''}`,
      ogImage: product.images[0],
      ogUrl: `${baseUrl}/p/${product.slug}`,
      ogType: 'product',
      structuredData: this.generateProductStructuredData(product, baseUrl, availability)
    };
    
    this.setSeoConfig(config);
  }

  /**
   * Configura título da página
   */
  private setTitle(title: string): void {
    this.title.setTitle(title);
  }

  /**
   * Configura meta description
   */
  private setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
  }

  /**
   * Configura meta keywords
   */
  private setKeywords(keywords: string): void {
    this.meta.updateTag({ name: 'keywords', content: keywords });
  }

  /**
   * Configura canonical URL
   * Funciona tanto no SSR quanto no browser
   */
  private setCanonical(url: string): void {
    // Remove canonical existente
    const existingCanonical = this.document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
    
    // Adiciona novo canonical
    const link = this.renderer.createElement('link');
    this.renderer.setAttribute(link, 'rel', 'canonical');
    this.renderer.setAttribute(link, 'href', url);
    this.renderer.appendChild(this.document.head, link);
  }

  /**
   * Configura Open Graph tags
   */
  private setOpenGraphTags(og: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type: string;
  }): void {
    this.meta.updateTag({ property: 'og:title', content: og.title });
    this.meta.updateTag({ property: 'og:description', content: og.description });
    this.meta.updateTag({ property: 'og:type', content: og.type });
    
    if (og.image) {
      this.meta.updateTag({ property: 'og:image', content: og.image });
    }
    
    if (og.url) {
      this.meta.updateTag({ property: 'og:url', content: og.url });
    }
  }

  /**
   * Configura Twitter Card tags
   */
  private setTwitterTags(twitter: {
    card: string;
    title: string;
    description: string;
    image?: string;
  }): void {
    this.meta.updateTag({ name: 'twitter:card', content: twitter.card });
    this.meta.updateTag({ name: 'twitter:title', content: twitter.title });
    this.meta.updateTag({ name: 'twitter:description', content: twitter.description });
    
    if (twitter.image) {
      this.meta.updateTag({ name: 'twitter:image', content: twitter.image });
    }
  }

  /**
   * Adiciona dados estruturados JSON-LD
   * Funciona tanto no SSR quanto no browser
   */
  private addStructuredData(data: any): void {
    // Remove script JSON-LD anterior se existir
    const existingScript = this.document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Adiciona novo script JSON-LD
    const script = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    this.renderer.appendChild(script, this.renderer.createText(JSON.stringify(data, null, 2)));
    this.renderer.appendChild(this.document.head, script);
  }

  /**
   * Gera dados estruturados para categoria (BreadcrumbList)
   */
  private generateCategoryStructuredData(category: Category, baseUrl: string): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': baseUrl
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': category.name,
          'item': `${baseUrl}/c/${category.slug}`
        }
      ]
    };
  }

  /**
   * Gera dados estruturados para produto
   */
  private generateProductStructuredData(product: Product, baseUrl: string, availability: string): any {
    const brand = product.attributes.find(attr => 
      attr.name.toLowerCase().includes('brand') || 
      attr.name.toLowerCase().includes('marca')
    );

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'description': product.description,
      'image': product.images,
      'brand': {
        '@type': 'Brand',
        'name': brand?.value || 'Storefront'
      },
      'offers': {
        '@type': 'Offer',
        'url': `${baseUrl}/p/${product.slug}`,
        'priceCurrency': 'USD',
        'price': product.price,
        'availability': `https://schema.org/${availability}`,
        'seller': {
          '@type': 'Organization',
          'name': 'Premium Storefront'
        }
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.5',
        'reviewCount': Math.floor(Math.random() * 100) + 10
      }
    };
  }

  /**
   * Remove todos os meta tags personalizados
   */
  clearSeoTags(): void {
    this.meta.removeTag('name="description"');
    this.meta.removeTag('name="keywords"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:image"');
    this.meta.removeTag('property="og:url"');
    this.meta.removeTag('property="og:type"');
    this.meta.removeTag('name="twitter:card"');
    this.meta.removeTag('name="twitter:title"');
    this.meta.removeTag('name="twitter:description"');
    this.meta.removeTag('name="twitter:image"');
    
    const canonical = this.document.querySelector('link[rel="canonical"]');
    const jsonLd = this.document.querySelector('script[type="application/ld+json"]');
    
    if (canonical) canonical.remove();
    if (jsonLd) jsonLd.remove();
  }
}
