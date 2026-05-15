import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimateResponseComponent } from './estimate-response.component';

describe('EstimateResponseComponent', () => {
  let component: EstimateResponseComponent;
  let fixture: ComponentFixture<EstimateResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EstimateResponseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstimateResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
