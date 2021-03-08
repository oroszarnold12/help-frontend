import { TestBed } from '@angular/core/testing';

import { QuizSubmissionService } from './quiz-submission.service';

describe('QuizSubmissionService', () => {
  let service: QuizSubmissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizSubmissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
