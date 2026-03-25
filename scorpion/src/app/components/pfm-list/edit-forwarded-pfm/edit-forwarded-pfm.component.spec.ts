import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditForwardedPFMComponent } from './edit-forwarded-pfm.component';

describe('EditForwardedPFMComponent', () => {
  let component: EditForwardedPFMComponent;
  let fixture: ComponentFixture<EditForwardedPFMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditForwardedPFMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditForwardedPFMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
