import { Component, Input, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PromotionFilterService } from './promotion-filter.service';
@Component({ selector:'app-remote-html-section', standalone:true, imports:[CommonModule], template:`<section class=\"relative\"><iframe *ngIf=\"trustedSrc\" [src]=\"trustedSrc\" class=\"w-full border-0\"  sandbox=\"allow-scripts allow-same-origin\" referrerpolicy=\"strict-origin-when-cross-origin\"></iframe></section>` })
export class RemoteHtmlSectionComponent implements OnDestroy {
  private router=inject(Router);
  private filter=inject(PromotionFilterService);
  private sanitizer = inject(DomSanitizer);
  trustedSrc: any;
  @Input() set src(v: string) { this.trustedSrc = this.sanitizer.bypassSecurityTrustResourceUrl(v); }
  @Input() height?: string;
  private onMsg=(ev: MessageEvent)=>{ const data:any = ev.data; if(!data||typeof data!=='object') return; if(data.type==='promo:filter'){ const cat = data.category ?? null; this.filter.setCategory(cat); this.router.navigate([], { queryParams: { cat }, queryParamsHandling: 'merge' }); } if(data.type==='remote:height' && typeof data.value==='number'){ document.documentElement.style.setProperty('--remote-height', `${data.value}px`); } };
  ngOnInit(){ window.addEventListener('message', this.onMsg); }
  ngOnDestroy(){ window.removeEventListener('message', this.onMsg); }
}
