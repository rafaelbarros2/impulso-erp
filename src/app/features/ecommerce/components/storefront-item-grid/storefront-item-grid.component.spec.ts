import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorefrontItemGridComponent } from './storefront-item-grid.component';

describe('StorefrontItemGridComponent', () => {
  let component: StorefrontItemGridComponent;
  let fixture: ComponentFixture<StorefrontItemGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontItemGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorefrontItemGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
