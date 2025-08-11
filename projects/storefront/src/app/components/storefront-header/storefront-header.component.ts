import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * A simplified storefront header component.
 *
 * Displays the store name and a cart icon with item count. Emits events when
 * the logo or cart are clicked. No dependency on layout or background services.
 */
@Component({
  selector: 'app-storefront-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storefront-header.component.html',
  styleUrls: ['./storefront-header.component.scss']
})
export class StorefrontHeaderComponent {
  /** Store name displayed in the header */
  @Input() storeName = 'Sua Loja';
  /** Number of items in the cart */
  @Input() cartItemCount = 0;
  /** Emit when the logo is clicked */
  @Output() logoClicked = new EventEmitter<void>();
  /** Emit when the cart icon is clicked */
  @Output() cartClicked = new EventEmitter<void>();

  onLogoClick() {
    this.logoClicked.emit();
  }
  onCartClick() {
    this.cartClicked.emit();
  }
}
