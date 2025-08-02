import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorefrontPagePromotionComponent } from './storefront-page-promotion.component';

describe('StorefrontPagePromotionComponent', () => {
  let component: StorefrontPagePromotionComponent;
  let fixture: ComponentFixture<StorefrontPagePromotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontPagePromotionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorefrontPagePromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
