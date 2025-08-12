import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'remote-html-iframe',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <iframe
        [attr.data-log-src]="src"
        [src]="safeSrc"
        [style.width.%]="100"
        [style.height]="height || '600px'"
        style="border:0; display:block"
        referrerpolicy="no-referrer"
        loading="lazy"
      ></iframe>
    </div>
  `
})
export class RemoteHtmlIframeSectionComponent {
  private readonly sanitizer = inject(DomSanitizer);
  safeSrc: SafeResourceUrl | null = null;

  @Input() set src(v: string | null) {
    const url = (v || '').trim();
    console.debug('[Iframe] set src:', url);
    this.safeSrc = url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }
  @Input() height?: string;
}
