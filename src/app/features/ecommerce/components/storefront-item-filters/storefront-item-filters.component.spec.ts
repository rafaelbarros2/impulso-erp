import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorefrontItemFiltersComponent } from './storefront-item-filters.component';

describe('StorefrontItemFiltersComponent', () => {
  let component: StorefrontItemFiltersComponent;
  let fixture: ComponentFixture<StorefrontItemFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontItemFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorefrontItemFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
