import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecureThemeIframeComponent } from './secure-theme-iframe.component';

describe('SecureThemeIframeComponent', () => {
  let component: SecureThemeIframeComponent;
  let fixture: ComponentFixture<SecureThemeIframeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecureThemeIframeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecureThemeIframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
