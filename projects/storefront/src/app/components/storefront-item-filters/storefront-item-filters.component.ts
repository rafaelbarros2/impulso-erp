import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilterChangeEvent } from '../../models/interfaces/filter.interfaces';

/**
 * A simplified item filters component.
 *
 * Provides basic search and filter capabilities. Emits events when filters change.
 */
@Component({
  selector: 'app-storefront-item-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storefront-item-filters.component.html',
  styleUrls: ['./storefront-item-filters.component.scss']
})
export class StorefrontItemFiltersComponent {
  /** Search term for filtering items */
  @Input() searchTerm = '';
  /** Emits when the search term changes */
  @Output() searchTermChange = new EventEmitter<string>();

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.searchTermChange.emit(this.searchTerm);
  }
}
