import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({ selector: '[appRipple]', standalone: true })
export class RippleDirective {
  constructor(private el: ElementRef<HTMLElement>, private r: Renderer2) {
    const host = this.el.nativeElement;
    host.style.position = host.style.position || 'relative';
    host.style.overflow = 'hidden';
  }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    const host = this.el.nativeElement;
    const circle = this.r.createElement('span');
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size/2;
    const y = e.clientY - rect.top - size/2;

    this.r.setStyle(circle, 'position', 'absolute');
    this.r.setStyle(circle, 'borderRadius', '50%');
    this.r.setStyle(circle, 'pointerEvents', 'none');
    this.r.setStyle(circle, 'width', `${size}px`);
    this.r.setStyle(circle, 'height', `${size}px`);
    this.r.setStyle(circle, 'left', `${x}px`);
    this.r.setStyle(circle, 'top', `${y}px`);
    this.r.setStyle(circle, 'background', 'currentColor');
    this.r.setStyle(circle, 'opacity', '.18');
    this.r.setStyle(circle, 'transform', 'scale(0)');
    this.r.setStyle(circle, 'transition', 'transform 420ms var(--ease-emphasized), opacity 600ms var(--ease-standard)');

    this.r.appendChild(host, circle);
    requestAnimationFrame(() => this.r.setStyle(circle, 'transform', 'scale(1)'));
    setTimeout(() => this.r.setStyle(circle, 'opacity', '0'), 180);
    setTimeout(() => this.r.removeChild(host, circle), 620);
  }
}
