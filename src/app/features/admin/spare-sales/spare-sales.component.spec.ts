import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpareSalesComponent } from './spare-sales.component';

describe('SpareSalesComponent', () => {
  let component: SpareSalesComponent;
  let fixture: ComponentFixture<SpareSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpareSalesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpareSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
