import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorefrontItemCardComponent } from './storefront-item-card.component';

describe('StorefrontItemCardComponent', () => {
  let component: StorefrontItemCardComponent;
  let fixture: ComponentFixture<StorefrontItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontItemCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorefrontItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
