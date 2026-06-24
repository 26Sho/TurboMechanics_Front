import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MechanicLayoutComponent } from './mechanic-layout.component';

describe('MechanicLayoutComponent', () => {
  let component: MechanicLayoutComponent;
  let fixture: ComponentFixture<MechanicLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MechanicLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MechanicLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
