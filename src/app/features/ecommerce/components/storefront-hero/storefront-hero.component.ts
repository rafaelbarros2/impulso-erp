import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

// Services
import { LayoutService } from '../../../../core/services/layout.service';

interface HeroContent {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonIcon?: string;
  backgroundImage?: string;
  textColor?: 'light' | 'dark';
}

interface HeroSlide {
  id: string;
  content: HeroContent;
  isActive?: boolean;
}

@Component({
  selector: 'app-storefront-hero',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule
  ],
  templateUrl: './storefront-hero.component.html',
  styleUrls: ['./storefront-hero.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-30px)' }))
      ])
    ]),
    trigger('fadeSlide', [
      state('active', style({ opacity: 1, transform: 'translateX(0)' })),
      state('inactive', style({ opacity: 0, transform: 'translateX(-20px)' })),
      transition('inactive => active', [
        animate('500ms ease-out')
      ]),
      transition('active => inactive', [
        animate('300ms ease-in')
      ])
    ]),
    trigger('buttonPulse', [
      transition('* => pulse', [
        animate('600ms ease-out', style({ transform: 'scale(1.05)' })),
        animate('400ms ease-in', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class StorefrontHeroComponent implements OnInit, OnDestroy {
  
  // Injeção de dependências
  private readonly layoutService = inject(LayoutService);

  // Inputs
  @Input() slides: HeroSlide[] = [
    {
      id: 'summer-collection',
      content: {
        title: 'Coleção Verão 2025',
        subtitle: 'Descubra as últimas tendências em moda com até 50% de desconto em peças selecionadas',
        buttonText: 'Explorar Coleção',
        buttonIcon: 'pi pi-arrow-right',
        backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920&h=1080',
        textColor: 'light'
      }
    },
    {
      id: 'new-arrivals',
      content: {
        title: 'Novidades da Semana',
        subtitle: 'Peças exclusivas recém-chegadas para renovar seu guarda-roupa com estilo único',
        buttonText: 'Ver Novidades',
        buttonIcon: 'pi pi-star',
        backgroundImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=1920&h=1080',
        textColor: 'light'
      }
    },
    {
      id: 'free-shipping',
      content: {
        title: 'Frete Grátis',
        subtitle: 'Em compras acima de R$ 200 para todo o Brasil. Aproveite essa oportunidade!',
        buttonText: 'Comprar Agora',
        buttonIcon: 'pi pi-shopping-cart',
        backgroundImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=1920&h=1080',
        textColor: 'light'
      }
    }
  ];
  
  @Input() autoSlide: boolean = true;
  @Input() slideInterval: number = 5000; // 5 segundos
  @Input() showSlideIndicators: boolean = true;
  @Input() allowManualSlide: boolean = true;
  @Input() height: string = 'auto'; // 'auto', '400px', '50vh', etc.
  
  // Outputs
  @Output() buttonClicked = new EventEmitter<HeroSlide>();
  @Output() slideChanged = new EventEmitter<{ previous: HeroSlide, current: HeroSlide }>();
  
  // Estados do componente
  isVisible: Signal<boolean> = this.layoutService.heroVisible;
  currentSlideIndex: number = 0;
  slideTimer: any = null;
  buttonPulseState: string = '';
  
  // Estado de animação
  isAnimating: boolean = false;
  
  constructor() {}

  ngOnInit(): void {
    this.initializeSlides();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  /**
   * Inicializa os slides marcando o primeiro como ativo
   */
  private initializeSlides(): void {
    if (this.slides.length > 0) {
      this.slides.forEach((slide, index) => {
        slide.isActive = index === 0;
      });
    }
  }

  /**
   * Inicia o slide automático
   */
  private startAutoSlide(): void {
    // Verifica a visibilidade do hero antes de iniciar
    if (!this.autoSlide || this.slides.length <= 1 || !this.isVisible()) return;
    
    this.stopAutoSlide(); // Para evitar múltiplos timers
    
    this.slideTimer = setInterval(() => {
      this.nextSlide();
    }, this.slideInterval);
  }

  /**
   * Para o slide automático
   */
  private stopAutoSlide(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
      this.slideTimer = null;
    }
  }

  /**
   * Vai para o próximo slide
   */
  nextSlide(): void {
    if (!this.allowManualSlide && this.slideTimer) return;
    if (this.isAnimating || this.slides.length <= 1) return;
    
    const previousSlide = this.slides[this.currentSlideIndex];
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    const currentSlide = this.slides[this.currentSlideIndex];
    
    this.changeSlide(previousSlide, currentSlide);
  }

  /**
   * Vai para o slide anterior
   */
  previousSlide(): void {
    if (!this.allowManualSlide) return;
    if (this.isAnimating || this.slides.length <= 1) return;
    
    const previousSlide = this.slides[this.currentSlideIndex];
    this.currentSlideIndex = this.currentSlideIndex === 0 
      ? this.slides.length - 1 
      : this.currentSlideIndex - 1;
    const currentSlide = this.slides[this.currentSlideIndex];
    
    this.changeSlide(previousSlide, currentSlide);
  }

  /**
   * Vai para um slide específico
   * @param index Índice do slide
   */
  goToSlide(index: number): void {
    if (!this.allowManualSlide) return;
    if (this.isAnimating || index === this.currentSlideIndex || index < 0 || index >= this.slides.length) return;
    
    const previousSlide = this.slides[this.currentSlideIndex];
    this.currentSlideIndex = index;
    const currentSlide = this.slides[this.currentSlideIndex];
    
    this.changeSlide(previousSlide, currentSlide);
    
    // Reinicia o auto slide
    if (this.autoSlide) {
      this.startAutoSlide();
    }
  }

  /**
   * Executa a mudança de slide
   * @param previousSlide Slide anterior
   * @param currentSlide Slide atual
   */
  private changeSlide(previousSlide: HeroSlide, currentSlide: HeroSlide): void {
    this.isAnimating = true;
    
    // Atualiza estados dos slides
    this.slides.forEach(slide => slide.isActive = false);
    currentSlide.isActive = true;
    
    // Emite evento de mudança
    this.slideChanged.emit({ previous: previousSlide, current: currentSlide });
    
    // Libera a animação após um delay
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  /**
   * Manipula clique no botão do hero
   * @param slide Slide atual
   */
  onButtonClick(slide: HeroSlide): void {
    // Animação de pulse no botão
    this.buttonPulseState = 'pulse';
    
    // Emite evento
    this.buttonClicked.emit(slide);
    
    // Reset do estado de animação
    setTimeout(() => {
      this.buttonPulseState = '';
    }, 1000);
  }

  /**
   * Retorna o slide atual
   */
  get currentSlide(): HeroSlide {
    return this.slides[this.currentSlideIndex] || this.slides[0];
  }

  /**
   * Verifica se deve mostrar os controles de navegação
   */
  get shouldShowNavigation(): boolean {
    return this.slides.length > 1 && this.allowManualSlide;
  }

  /**
   * Verifica se deve mostrar os indicadores
   */
  get shouldShowIndicators(): boolean {
    return this.slides.length > 1 && this.showSlideIndicators;
  }

  /**
   * Retorna a classe CSS para o slide baseado no tema
   */
  getSlideClass(slide: HeroSlide): string {
    const baseClass = 'hero-slide';
    const textClass = slide.content.textColor === 'dark' ? 'text-dark' : 'text-light';
    const activeClass = slide.isActive ? 'active' : 'inactive';
    
    return `${baseClass} ${textClass} ${activeClass}`;
  }

  /**
   * Retorna o estilo inline para background customizado
   */
  getSlideStyle(slide: HeroSlide): any {
    const styles: any = {};
    
    if (slide.content.backgroundImage) {
      styles['background-image'] = `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url(${slide.content.backgroundImage})`;
      styles['background-size'] = 'cover';
      styles['background-position'] = 'center';
    }
    
    if (this.height !== 'auto') {
      styles['height'] = this.height;
    }
    
    return styles;
  }

  /**
   * Manipula eventos de teclado para navegação
   * @param event Evento de teclado
   */
  onKeydown(event: KeyboardEvent): void {
    if (!this.allowManualSlide) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousSlide();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextSlide();
        break;
      case 'Home':
        event.preventDefault();
        this.goToSlide(0);
        break;
      case 'End':
        event.preventDefault();
        this.goToSlide(this.slides.length - 1);
        break;
    }
  }

  /**
   * Pausa o auto slide quando o mouse entra
   */
  onMouseEnter(): void {
    if (this.autoSlide) {
      this.stopAutoSlide();
    }
  }

  /**
   * Retoma o auto slide quando o mouse sai
   */
  onMouseLeave(): void {
    if (this.autoSlide && this.isVisible()) {
      this.startAutoSlide();
    }
  }

  /**
   * TrackBy function para otimizar renderização dos slides
   * @param index Índice do slide
   * @param slide Objeto do slide
   */
  trackBySlideId(index: number, slide: HeroSlide): string {
    return slide.id;
  }

  /**
   * Carrega slides mockados para loja de moda (padrão)
   */
  loadFashionSlides(): void {
    this.slides = [
      {
        id: 'summer-collection',
        content: {
          title: 'Coleção Verão 2025',
          subtitle: 'Descubra as últimas tendências em moda com até 50% de desconto em peças selecionadas',
          buttonText: 'Explorar Coleção',
          buttonIcon: 'pi pi-arrow-right',
          backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920&h=1080',
          textColor: 'light'
        }
      },
      {
        id: 'new-arrivals',
        content: {
          title: 'Novidades da Semana',
          subtitle: 'Peças exclusivas recém-chegadas para renovar seu guarda-roupa com estilo único',
          buttonText: 'Ver Novidades',
          buttonIcon: 'pi pi-star',
          backgroundImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=1920&h=1080',
          textColor: 'light'
        }
      },
      {
        id: 'free-shipping',
        content: {
          title: 'Frete Grátis',
          subtitle: 'Em compras acima de R$ 200 para todo o Brasil. Aproveite essa oportunidade!',
          buttonText: 'Comprar Agora',
          buttonIcon: 'pi pi-shopping-cart',
          backgroundImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=1920&h=1080',
          textColor: 'light'
        }
      }
    ];
    this.initializeSlides();
  }

  /**
   * Carrega slides mockados para loja de tecnologia
   */
  loadTechSlides(): void {
    this.slides = [
      {
        id: 'tech-deals',
        content: {
          title: 'Mega Promoção Tech',
          subtitle: 'Smartphones, notebooks e acessórios com até 40% de desconto. Últimas unidades!',
          buttonText: 'Ver Ofertas',
          buttonIcon: 'pi pi-bolt',
          backgroundImage: 'https://images.unsplash.com/photo-1519389950473-47ba0cfaee5d?auto=format&fit=crop&q=80&w=1920&h=1080',
          textColor: 'light'
        }
      },
      {
        id: 'launch-event',
        content: {
          title: 'Lançamento Exclusivo',
          subtitle: 'Seja o primeiro a ter os novos dispositivos Apple. Pré-venda disponível agora',
          buttonText: 'Pré-Venda',
          buttonIcon: 'pi pi-mobile',
          backgroundImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1920&h=1080',
          textColor: 'light'
        }
      }
    ];
    this.initializeSlides();
  }

  /**
   * Carrega slides mockados para loja de beleza/cosméticos
   */
  loadBeautySlides(): void {
    this.slides = [
      {
        id: 'beauty-routine',
        content: {
          title: 'Sua Rotina de Beleza',
          subtitle: 'Produtos premium para cuidar da sua pele todos os dias com resultados visíveis',
          buttonText: 'Descobrir Produtos',
          buttonIcon: 'pi pi-heart',
          backgroundImage: 'https://images.unsplash.com/photo-1557850841-f7615951d384?auto=format&fit=crop&q=80&w=1920&h=1080',
          textColor: 'light'
        }
      },
      {
        id: 'makeup-collection',
        content: {
          title: 'Nova Coleção Makeup',
          subtitle: 'Cores vibrantes e texturas incríveis para realçar sua beleza natural',
          buttonText: 'Ver Coleção',
          buttonIcon: 'pi pi-palette',
          backgroundImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1920&h=1080',
          textColor: 'light'
        }
      }
    ];
    this.initializeSlides();
  }

  /**
   * Carrega slides mockados para marketplace/multi-categoria
   */
  loadMarketplaceSlides(): void {
    this.slides = [
      {
        id: 'black-friday',
        content: {
          title: 'Black Friday 2025',
          subtitle: 'Descontos de até 80% em milhares de produtos. Não perca essa oportunidade única!',
          buttonText: 'Ver Todas as Ofertas',
          buttonIcon: 'pi pi-tags',
          backgroundImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1920&h=1080',
          textColor: 'light'
        }
      },
      {
        id: 'fast-delivery',
        content: {
          title: 'Entrega Ultra Rápida',
          subtitle: 'Receba seus produtos em até 24h em mais de 500 cidades pelo Brasil',
          buttonText: 'Consulte sua Região',
          buttonIcon: 'pi pi-send',
          backgroundImage: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=1920&h=1080',
          textColor: 'light'
        }
      },
      {
        id: 'customer-rewards',
        content: {
          title: 'Programa de Fidelidade',
          subtitle: 'Acumule pontos e ganhe descontos exclusivos em suas próximas compras',
          buttonText: 'Participar Agora',
          buttonIcon: 'pi pi-star-fill',
          backgroundImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1920&h=1080',
          textColor: 'light'
        }
      }
    ];
    this.initializeSlides();
  }

  /**
   * Carrega slide único promocional
   */
  loadSinglePromo(): void {
    this.slides = [
      {
        id: 'mega-sale',
        content: {
          title: 'Liquidação Total',
          subtitle: 'Últimas peças com até 70% de desconto. Aproveite antes que acabe o estoque!',
          buttonText: 'Aproveitar Agora',
          buttonIcon: 'pi pi-clock',
          backgroundImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1920&h=1080',
          textColor: 'light'
        }
      }
    ];
    this.initializeSlides();
  }

  /**
   * Carrega slides baseado em uma categoria de loja
   * @param storeType Tipo da loja
   */
  loadSlidesByStoreType(storeType: 'fashion' | 'tech' | 'beauty' | 'marketplace' | 'promo'): void {
    switch (storeType) {
      case 'fashion':
        this.loadFashionSlides();
        break;
      case 'tech':
        this.loadTechSlides();
        break;
      case 'beauty':
        this.loadBeautySlides();
        break;
      case 'marketplace':
        this.loadMarketplaceSlides();
        break;
      case 'promo':
        this.loadSinglePromo();
        break;
      default:
        this.loadFashionSlides();
    }
  }  
  }