import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutWhatsappPageComponent } from './checkout-whatsapp-page.component';

describe('CheckoutWhatsappPageComponent', () => {
  let component: CheckoutWhatsappPageComponent;
  let fixture: ComponentFixture<CheckoutWhatsappPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutWhatsappPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutWhatsappPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
