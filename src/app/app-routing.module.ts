import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { CourseViewComponent } from "./course-view/course-view.component";
import { LogInComponent } from "./log-in/log-in.component";
import { GuardService } from "./guards/guard.service";
import { AuthGuardService } from "./guards/auth-guard.service";
import { RegistrationComponent } from "./registration/registration.component";
import { AdminViewComponent } from "./admin-view/admin-view.component";
import { AdminGuardService } from "./guards/admin-guard.service";
import { AnnouncementViewComponent } from "./announcement-view/announcement-view.component";
import { AssignmentViewComponent } from "./assignment-view/assignment-view.component";
import { DiscussionViewComponent } from "./discussion-view/discussion-view.component";
import { SubmissionViewComponent } from "./submission-view/submission-view.component";
import { TeacherGuardService } from "./guards/teacher-guard.service";
import { QuizViewComponent } from "./quiz-view/quiz-view.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "login",
    component: LogInComponent,
    canActivate: [GuardService],
  },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: "courses/:id",
    component: CourseViewComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: "registration",
    component: RegistrationComponent,
  },
  {
    path: "admin",
    component: AdminViewComponent,
    canActivate: [AdminGuardService],
  },
  {
    path: "courses/:courseId/announcements/:announcementId",
    component: AnnouncementViewComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: "courses/:courseId/assignments/:assignmentId",
    component: AssignmentViewComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: "courses/:courseId/quizzes/:quizId",
    component: QuizViewComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: "courses/:courseId/discussions/:discussionId",
    component: DiscussionViewComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: "courses/:courseId/assignments/:assignmentId/submissions",
    component: SubmissionViewComponent,
    canActivate: [TeacherGuardService],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
