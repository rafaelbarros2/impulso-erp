import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorefrontPageComponent } from './storefront-page.component';

describe('StorefrontPageComponent', () => {
  let component: StorefrontPageComponent;
  let fixture: ComponentFixture<StorefrontPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorefrontPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
