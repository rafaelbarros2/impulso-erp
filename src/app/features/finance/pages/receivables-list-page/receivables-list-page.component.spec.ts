import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivablesListPageComponent } from './receivables-list-page.component';

describe('ReceivablesListPageComponent', () => {
  let component: ReceivablesListPageComponent;
  let fixture: ComponentFixture<ReceivablesListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivablesListPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivablesListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
