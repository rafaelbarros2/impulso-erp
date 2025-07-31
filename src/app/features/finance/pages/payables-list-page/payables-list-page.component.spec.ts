import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayablesListPageComponent } from './payables-list-page.component';

describe('PayablesListPageComponent', () => {
  let component: PayablesListPageComponent;
  let fixture: ComponentFixture<PayablesListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayablesListPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayablesListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
