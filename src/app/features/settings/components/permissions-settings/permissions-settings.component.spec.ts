import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsSettingsComponent } from './permissions-settings.component';

describe('PermissionsSettingsComponent', () => {
  let component: PermissionsSettingsComponent;
  let fixture: ComponentFixture<PermissionsSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
