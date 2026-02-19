import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PODPFMCriteriaComponent } from './podpfmcriteria.component';

describe('PODPFMCriteriaComponent', () => {
  let component: PODPFMCriteriaComponent;
  let fixture: ComponentFixture<PODPFMCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PODPFMCriteriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PODPFMCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
