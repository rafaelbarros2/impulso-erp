import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * A simplified categories component.
 *
 * This component displays a list of categories and emits events when a category is clicked.
 * It does not depend on any external services and can be extended as needed.
 */
export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  itemCount?: number;
  featured?: boolean;
}

@Component({
  selector: 'app-storefront-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storefront-categories.component.html',
  styleUrls: ['./storefront-categories.component.scss']
})
export class StorefrontCategoriesComponent implements OnInit, OnChanges {
  /** List of categories to display */
  @Input() categories: CategoryItem[] = [];
  /** Whether to show item counts */
  @Input() showItemCount = true;
  /** Title displayed above the categories */
  @Input() title = 'Categorias';
  /** Emits when a category is clicked */
  @Output() categoryClicked = new EventEmitter<CategoryItem>();

  ngOnInit(): void {
    console.log('[StorefrontCategoriesComponent] OnInit - categories:', this.categories);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('categories' in changes) {
      console.log('[StorefrontCategoriesComponent] Categories changed:', changes['categories'].currentValue);
    }
    if ('title' in changes) {
      console.log('[StorefrontCategoriesComponent] Title changed:', changes['title'].currentValue);  
    }
  }

  onCategoryClick(category: CategoryItem) {
    this.categoryClicked.emit(category);
  }
}
