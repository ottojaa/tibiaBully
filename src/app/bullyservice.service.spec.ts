import { TestBed } from '@angular/core/testing';

import { BullyserviceService } from './bullyservice.service';

describe('BullyserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BullyserviceService = TestBed.get(BullyserviceService);
    expect(service).toBeTruthy();
  });
});
