import { Injectable, inject } from '@angular/core';
import { Response } from 'express';
import { SitemapService } from '../services/sitemap.service';
import { SitemapConfig } from '../models/interfaces/sitemap.interfaces';

/**
 * Handlers para rotas de SEO (sitemap e robots)
 * Para uso em Express server durante SSR
 */

@Injectable({
  providedIn: 'root'
})
export class SeoRoutesService {
  private sitemapService = inject(SitemapService);

  /**
   * Handler para /sitemap.xml
   */
  async handleSitemap(req: any, res: Response): Promise<void> {
    try {
      const config: SitemapConfig = {
        baseUrl: this.getBaseUrl(req),
        storeId: this.getStoreId(req),
        maxUrls: 50000
      };

      const sitemap = await this.sitemapService.generateSitemap(config).toPromise();
      
      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      });
      
      res.send(sitemap);
    } catch (error) {
      console.error('[SeoRoutesService] Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  }

  /**
   * Handler para /robots.txt
   */
  handleRobots(req: any, res: Response): void {
    try {
      const config: SitemapConfig = {
        baseUrl: this.getBaseUrl(req),
        storeId: this.getStoreId(req)
      };

      const robotsTxt = this.sitemapService.generateRobotsTxt(config);
      
      res.set({
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
      });
      
      res.send(robotsTxt);
    } catch (error) {
      console.error('[SeoRoutesService] Error generating robots.txt:', error);
      res.status(500).send('Error generating robots.txt');
    }
  }

  /**
   * Extrai base URL da requisição
   */
  private getBaseUrl(req: any): string {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || req.get('host');
    return `${protocol}://${host}`;
  }

  /**
   * Determina ID da loja baseado na requisição
   */
  private getStoreId(req: any): string {
    const host = req.headers.host || '';
    const path = req.path || '';
    
    // Lógica para determinar loja por subdomínio ou path
    if (host.includes('pink') || path.includes('/pink')) {
      return 'pink';
    }
    
    if (host.includes('minimal') || path.includes('/minimal')) {
      return 'minimal';
    }
    
    return 'default';
  }
}