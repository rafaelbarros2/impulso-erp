import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, AfterViewInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shadow-dom-theme',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #host></div>
  `,
  styles: [':host { display: block; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None // We will use Shadow DOM manually
})
export class ShadowDomThemeComponent implements OnChanges, AfterViewInit {
  @Input() htmlContent?: string;
  @Input() height: string = '100%';

  @ViewChild('host', { static: true }) host?: ElementRef<HTMLDivElement>;

  private shadowRoot?: ShadowRoot;

  ngOnChanges(changes: SimpleChanges): void {
    if ('htmlContent' in changes) {
      this.renderContent();
    }
  }

  ngAfterViewInit() {
    if (this.host && !this.shadowRoot) {
      this.shadowRoot = this.host.nativeElement.attachShadow({ mode: 'open' });
    }
    this.renderContent();
  }

  private renderContent() {
    if (this.shadowRoot && this.htmlContent) {
      this.shadowRoot.innerHTML = ''; // Clear previous content

      const template = document.createElement('template');
      template.innerHTML = this.htmlContent;

      // First, append all non-script elements
      Array.from(template.content.childNodes).forEach(node => {
        if (node.nodeName !== 'SCRIPT') {
          this.shadowRoot!.appendChild(node.cloneNode(true));
        }
      });

      // Then, create and append script elements to execute them
      const scripts = template.content.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        // Copy attributes
        for (let i = 0; i < script.attributes.length; i++) {
          newScript.setAttribute(script.attributes[i].name, script.attributes[i].value);
        }
        // Copy content
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        this.shadowRoot!.appendChild(newScript);
      });

      // Add the style tag
      const style = document.createElement('style');
      style.textContent = `
        :host {
          display: block;
          height: ${this.height};
        }
      `;
      this.shadowRoot.prepend(style);
    }
  }
}