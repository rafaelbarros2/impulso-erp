import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorefrontBackgroundSelectorComponent } from './storefront-background-selector.component';

describe('StorefrontBackgroundSelectorComponent', () => {
  let component: StorefrontBackgroundSelectorComponent;
  let fixture: ComponentFixture<StorefrontBackgroundSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontBackgroundSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorefrontBackgroundSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
