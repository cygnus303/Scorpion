import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LrFinacialEditComponent } from './lr-finacial-edit.component';

describe('LrFinacialEditComponent', () => {
  let component: LrFinacialEditComponent;
  let fixture: ComponentFixture<LrFinacialEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LrFinacialEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LrFinacialEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
