import { TestBed } from '@angular/core/testing';

import { GeneralMasterService } from './general-master.service';

describe('GeneralMasterService', () => {
  let service: GeneralMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneralMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
