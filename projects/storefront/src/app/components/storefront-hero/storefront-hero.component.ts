import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeroSlide } from '../../models/interfaces/hero.interfaces';

import { HeroSlide } from '../../models/interfaces/hero.interfaces';

/**
 * A simplified hero/slideshow component.
 *
 * Displays a series of slides and handles basic slide navigation. The slides
 * can be provided via the `slides` input. This component does not depend on
 * any external services.
 */
@Component({
  selector: 'app-storefront-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storefront-hero.component.html',
  styleUrls: ['./storefront-hero.component.scss']
})
export class StorefrontHeroComponent implements OnInit, OnDestroy, OnChanges {
  /** Slides to display in the hero */
  @Input() slides: HeroSlide[] = [
    {
      id: 'slide-1',
      title: 'Coleção de Verão 2025',
      subtitle: 'Novas tendências em moda com descontos exclusivos',
      buttonText: 'Comprar Agora',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920&h=1080'
    },
    {
      id: 'slide-2',
      title: 'Novo Estoque!',
      subtitle: 'Produtos recém-chegados para complementar seu estilo',
      buttonText: 'Ver Produtos',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=1920&h=1080'
    }
  ];
  /** Automatically cycle through slides */
  @Input() autoSlide = true;
  /** Interval between slides in milliseconds */
  @Input() slideInterval = 5000;
  /** Emits when the call-to-action button is clicked */
  @Output() buttonClicked = new EventEmitter<HeroSlide>();
  /** Current slide index */
  currentSlideIndex = 0;
  private slideTimer: any;

  ngOnChanges(changes: SimpleChanges): void {
    if ('slides' in changes) {
      console.log('[StorefrontHeroComponent] Slides changed:', changes['slides'].currentValue);
      this.startAutoSlide();
    }
  }

  ngOnInit(): void {
    console.log('[StorefrontHeroComponent] OnInit - slides:', this.slides);
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  get currentSlide(): HeroSlide {
    const slides = Array.isArray(this.slides) ? this.slides : [];
    return slides.length ? slides[this.currentSlideIndex % slides.length] : {
      id: 'fallback',
      title: '',
      subtitle: '',
      buttonText: '',
      image: ''
    };
  }

  nextSlide() {
    const len = Array.isArray(this.slides) ? this.slides.length : 0;
    if (len > 0) this.currentSlideIndex = (this.currentSlideIndex + 1) % len;
  }

  previousSlide() {
    const len = Array.isArray(this.slides) ? this.slides.length : 0;
    if (len > 0) {
      this.currentSlideIndex = this.currentSlideIndex === 0 ? len - 1 : this.currentSlideIndex - 1;
    }
  }

  startAutoSlide() {
    const len = Array.isArray(this.slides) ? this.slides.length : 0;
    if (!this.autoSlide || len <= 1) return;
    this.stopAutoSlide();
    this.slideTimer = setInterval(() => {
      this.nextSlide();
    }, this.slideInterval);
  }

  stopAutoSlide() {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
      this.slideTimer = null;
    }
  }

  onButtonClick() {
    this.buttonClicked.emit(this.currentSlide);
  }
}
