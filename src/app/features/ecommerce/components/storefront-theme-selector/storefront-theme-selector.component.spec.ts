import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorefrontThemeSelectorComponent } from './storefront-theme-selector.component';

describe('StorefrontThemeSelectorComponent', () => {
  let component: StorefrontThemeSelectorComponent;
  let fixture: ComponentFixture<StorefrontThemeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontThemeSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorefrontThemeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
