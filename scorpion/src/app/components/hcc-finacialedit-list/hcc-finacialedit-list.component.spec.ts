import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HccFinacialeditListComponent } from './hcc-finacialedit-list.component';

describe('HccFinacialeditListComponent', () => {
  let component: HccFinacialeditListComponent;
  let fixture: ComponentFixture<HccFinacialeditListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HccFinacialeditListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HccFinacialeditListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
