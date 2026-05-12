import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalDiagnosisComponent } from './technical-diagnosis.component';

describe('TechnicalDiagnosisComponent', () => {
  let component: TechnicalDiagnosisComponent;
  let fixture: ComponentFixture<TechnicalDiagnosisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TechnicalDiagnosisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TechnicalDiagnosisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
