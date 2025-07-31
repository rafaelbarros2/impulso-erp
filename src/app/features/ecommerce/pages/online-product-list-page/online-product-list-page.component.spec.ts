import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineProductListPageComponent } from './online-product-list-page.component';

describe('OnlineProductListPageComponent', () => {
  let component: OnlineProductListPageComponent;
  let fixture: ComponentFixture<OnlineProductListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineProductListPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineProductListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
