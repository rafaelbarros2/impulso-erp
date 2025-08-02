import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorefrontHeaderComponent } from './storefront-header.component';

describe('StorefrontHeaderComponent', () => {
  let component: StorefrontHeaderComponent;
  let fixture: ComponentFixture<StorefrontHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorefrontHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
