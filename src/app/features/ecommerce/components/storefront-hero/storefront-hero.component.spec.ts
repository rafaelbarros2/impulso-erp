import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorefrontHeroComponent } from './storefront-hero.component';

describe('StorefrontHeroComponent', () => {
  let component: StorefrontHeroComponent;
  let fixture: ComponentFixture<StorefrontHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontHeroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorefrontHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
