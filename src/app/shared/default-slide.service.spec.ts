import { TestBed } from '@angular/core/testing';

import { DefaultSlideService } from './default-slide.service';

describe('DefaultSlideService', () => {
  let service: DefaultSlideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DefaultSlideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
