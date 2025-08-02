import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorefrontCategoriesComponent } from './storefront-categories.component';

describe('StorefrontCategoriesComponent', () => {
  let component: StorefrontCategoriesComponent;
  let fixture: ComponentFixture<StorefrontCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorefrontCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
