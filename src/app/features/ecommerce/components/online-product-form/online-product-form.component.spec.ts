import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineProductFormComponent } from './online-product-form.component';

describe('OnlineProductFormComponent', () => {
  let component: OnlineProductFormComponent;
  let fixture: ComponentFixture<OnlineProductFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineProductFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
