import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-storefront-layout-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="layout-shell">
      <header class="layout-header"><ng-content select="[slot=header]"></ng-content></header>
      <section class="layout-hero"><ng-content select="[slot=hero]"></ng-content></section>
      <main class="layout-main"><ng-content select="[slot=main]"></ng-content></main>
      <aside *ngIf="showAside" class="layout-aside"><ng-content select="[slot=aside]"></ng-content></aside>
      <footer class="layout-footer"><ng-content select="[slot=footer]"></ng-content></footer>
    </div>
  `,
  styleUrls: ['./storefront-layout-shell.component.scss']
})
export class StorefrontLayoutShellComponent {
  @Input() showAside = false;
}
