import { TestBed } from '@angular/core/testing';

import { ReceptionVoucherService } from './reception-voucher.service';

describe('ReceptionVoucherService', () => {
  let service: ReceptionVoucherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceptionVoucherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
