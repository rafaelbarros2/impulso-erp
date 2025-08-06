import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ButtonSeverity } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="empty-state-container" [ngClass]="containerClass">
      <div class="empty-state-icon" *ngIf="icon">
        <i [class]="icon" [style.font-size]="iconSize" [style.color]="iconColor"></i>
      </div>
      
      <div class="empty-state-content">
        <h3 class="empty-state-title" *ngIf="title">{{ title }}</h3>
        <p class="empty-state-description" *ngIf="description">{{ description }}</p>
      </div>

      <div class="empty-state-actions" *ngIf="actionLabel">
        <p-button 
          [label]="actionLabel"
          [icon]="actionIcon"
          [severity]="actionSeverity"
          [outlined]="actionOutlined"
          (click)="onAction()"
          [disabled]="actionDisabled">
        </p-button>
        
        <p-button 
          *ngIf="secondaryActionLabel"
          [label]="secondaryActionLabel"
          [icon]="secondaryActionIcon"
          severity="secondary"
          [outlined]="true"
          (click)="onSecondaryAction()"
          [disabled]="secondaryActionDisabled">
        </p-button>
      </div>
    </div>
  `,
  styles: [`
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 2rem;
      min-height: 300px;
      animation: fadeIn 0.3s ease-in;
    }

    .empty-state-icon {
      margin-bottom: 1.5rem;
      opacity: 0.6;
    }

    .empty-state-content {
      margin-bottom: 2rem;
      max-width: 400px;
    }

    .empty-state-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0 0 0.75rem 0;
    }

    .empty-state-description {
      font-size: 1rem;
      color: var(--text-color-secondary);
      line-height: 1.5;
      margin: 0;
    }

    .empty-state-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    /* Size variants */
    .size-sm {
      padding: 2rem 1rem;
      min-height: 200px;
    }

    .size-sm .empty-state-title {
      font-size: 1.25rem;
    }

    .size-sm .empty-state-description {
      font-size: 0.875rem;
    }

    .size-lg {
      padding: 4rem 2rem;
      min-height: 400px;
    }

    .size-lg .empty-state-title {
      font-size: 2rem;
    }

    .size-lg .empty-state-description {
      font-size: 1.125rem;
    }

    /* Theme variants */
    .theme-info .empty-state-icon {
      color: var(--blue-500);
    }

    .theme-warning .empty-state-icon {
      color: var(--yellow-500);
    }

    .theme-error .empty-state-icon {
      color: var(--red-500);
    }

    .theme-success .empty-state-icon {
      color: var(--green-500);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .empty-state-container {
        padding: 2rem 1rem;
      }

      .empty-state-actions {
        flex-direction: column;
        width: 100%;
        max-width: 300px;
      }

      .empty-state-actions :deep(p-button) {
        width: 100%;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() icon: string = 'pi pi-inbox';
  @Input() iconSize: string = '4rem';
  @Input() iconColor: string = '';
  
  @Input() actionLabel: string = '';
  @Input() actionIcon: string = '';
  @Input() actionSeverity: ButtonSeverity = "primary";
  @Input() actionOutlined: boolean = false;
  @Input() actionDisabled: boolean = false;
  
  @Input() secondaryActionLabel: string = '';
  @Input() secondaryActionIcon: string = '';
  @Input() secondaryActionDisabled: boolean = false;
  
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() theme: 'default' | 'info' | 'warning' | 'error' | 'success' = 'default';
  @Input() containerClass: string = '';

  @Output() action = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  get finalContainerClass(): string {
    const classes = [];
    
    if (this.size !== 'md') {
      classes.push(`size-${this.size}`);
    }
    
    if (this.theme !== 'default') {
      classes.push(`theme-${this.theme}`);
    }
    
    return `${classes.join(' ')} ${this.containerClass}`.trim();
  }

  onAction(): void {
    this.action.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }
}

// Predefined empty states for common scenarios
export const EMPTY_STATES = {
  NO_DATA: {
    title: 'Nenhum dado encontrado',
    description: 'Não há informações para exibir no momento.',
    icon: 'pi pi-inbox',
    theme: 'default' as const
  },
  NO_RESULTS: {
    title: 'Nenhum resultado encontrado',
    description: 'Tente ajustar os filtros ou termos de busca.',
    icon: 'pi pi-search',
    theme: 'info' as const
  },
  NO_PRODUCTS: {
    title: 'Nenhum produto cadastrado',
    description: 'Comece adicionando seu primeiro produto ao catálogo.',
    icon: 'pi pi-shopping-bag',
    actionLabel: 'Adicionar Produto',
    actionIcon: 'pi pi-plus',
    theme: 'default' as const
  },
  NO_CLIENTS: {
    title: 'Nenhum cliente cadastrado',
    description: 'Cadastre seus primeiros clientes para começar a vender.',
    icon: 'pi pi-users',
    actionLabel: 'Adicionar Cliente',
    actionIcon: 'pi pi-plus',
    theme: 'default' as const
  },
  NO_ORDERS: {
    title: 'Nenhum pedido encontrado',
    description: 'Quando você receber pedidos, eles aparecerão aqui.',
    icon: 'pi pi-shopping-cart',
    theme: 'default' as const
  },
  EMPTY_CART: {
    title: 'Seu carrinho está vazio',
    description: 'Adicione produtos ao carrinho para continuar.',
    icon: 'pi pi-shopping-cart',
    actionLabel: 'Ver Produtos',
    actionIcon: 'pi pi-arrow-right',
    theme: 'default' as const
  },
  ERROR_STATE: {
    title: 'Algo deu errado',
    description: 'Não foi possível carregar os dados. Tente novamente.',
    icon: 'pi pi-exclamation-triangle',
    actionLabel: 'Tentar Novamente',
    actionIcon: 'pi pi-refresh',
    theme: 'error' as const
  },
  MAINTENANCE: {
    title: 'Em manutenção',
    description: 'Esta funcionalidade está temporariamente indisponível.',
    icon: 'pi pi-cog',
    theme: 'warning' as const
  },
  COMING_SOON: {
    title: 'Em breve',
    description: 'Esta funcionalidade estará disponível em breve.',
    icon: 'pi pi-clock',
    theme: 'info' as const
  }
} as const;