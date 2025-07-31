import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialDashboardPageComponent } from './financial-dashboard-page.component';

describe('FinancialDashboardPageComponent', () => {
  let component: FinancialDashboardPageComponent;
  let fixture: ComponentFixture<FinancialDashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialDashboardPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialDashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
