import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'remote-html-iframe',
  standalone: true,
  imports: [CommonModule],
  template: `
  <iframe *ngIf="safeSrc"
    [src]="safeSrc"
    class="w-full border-0"
    [style.minHeight]="height || '600px'"
    sandbox="allow-scripts allow-same-origin">
  </iframe>
  `
})
export class RemoteHtmlIframeSectionComponent {
  private readonly sanitizer = inject(DomSanitizer);

  @Input() set src(url: string) {
    this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  @Input() height?: string;

  safeSrc: SafeResourceUrl | null = null;
}
