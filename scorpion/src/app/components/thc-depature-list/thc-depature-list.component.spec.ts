import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThcDepatureListComponent } from './thc-depature-list.component';

describe('ThcDepatureListComponent', () => {
  let component: ThcDepatureListComponent;
  let fixture: ComponentFixture<ThcDepatureListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThcDepatureListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThcDepatureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
