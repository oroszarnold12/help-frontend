import { TestBed } from '@angular/core/testing';

import { QuizTimerService } from './quiz-timer.service';

describe('QuizTimerService', () => {
  let service: QuizTimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizTimerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
