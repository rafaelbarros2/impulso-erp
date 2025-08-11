import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreBackgroundService } from '../../services/core/core-background.service';

@Component({
  selector: 'app-storefront-background-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storefront-background-selector.component.html'
})
export class StorefrontBackgroundSelectorComponent {
  items: ReturnType<CoreBackgroundService['list']>;
  currentId: ReturnType<typeof computed>;

  constructor(private bg: CoreBackgroundService) {
    this.items = this.bg.list();
    this.currentId = computed(() => this.bg.currentId());
  }

  setBg(id: string) { this.bg.set(id); }
}
