import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DefaultSlideService } from 'src/app/shared/default-slide.service';
import { Course } from '../../model/course.model';

@Component({
  selector: 'app-course-card',
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.scss'],
})
export class CourseCardComponent {
  @Input() course: Course;

  constructor(
    private defaultSlideService: DefaultSlideService,
    private router: Router
  ) {}

  goToSlide(slide: number): void {
    this.defaultSlideService.changeDefaultSlide(slide);
    this.router.navigate([`/courses/${this.course.id}`]);
  }
}
