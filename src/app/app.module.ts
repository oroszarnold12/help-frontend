import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { CourseCardComponent } from "./dashboard/course-card/course-card.component";
import { TopbarComponent } from "./topbar/topbar.component";
import { CourseViewComponent } from "./course-view/course-view.component";
import { LogInComponent } from "./log-in/log-in.component";
import { RegistrationComponent } from "./registration/registration.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TokenInterceptor } from "./interceptor/token.interceptor";
import { ToastrModule } from "ngx-toastr";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CardComponent } from "./course-view/card/card.component";
import { DatePipe } from "@angular/common";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { CourseFormComponent } from "./dashboard/course-form/course-form.component";
import { AnnouncementFormComponent } from "./course-view/announcement-form/announcement-form.component";
import { AssignmentFormComponent } from "./course-view/assignment-form/assignment-form.component";
import { QuillModule } from "ngx-quill";
import { DiscussionFormComponent } from "./course-view/discussion-form/discussion-form.component";
import { InvitationCardComponent } from "./dashboard/invitation-card/invitation-card.component";
import { LoadingInterceptor } from "./interceptor/loading.interceptor";
import { AdminViewComponent } from "./admin-view/admin-view.component";
import { AnnouncementViewComponent } from "./announcement-view/announcement-view.component";
import { AssignmentViewComponent } from "./assignment-view/assignment-view.component";
import { DiscussionViewComponent } from "./discussion-view/discussion-view.component";
import { AnnouncementCommentFormComponent } from "./announcement-view/announcement-comment-form/announcement-comment-form.component";
import { DiscussionCommentFormComponent } from "./discussion-view/discussion-comment-form/discussion-comment-form.component";
import { SubmissionViewComponent } from "./submission-view/submission-view.component";
import { QuizFormComponent } from "./course-view/quiz-form/quiz-form.component";
import { QuizViewComponent } from "./quiz-view/quiz-view.component";
import { QuestionFormComponent } from "./quiz-view/question-form/question-form.component";
import { QuizTakingViewComponent } from "./quiz-taking-view/quiz-taking-view.component";
import { ParticipationsViewComponent } from "./participations-view/participations-view.component";
import { UserDetailsViewComponent } from "./user-details-view/user-details-view.component";
import { ChatViewComponent } from "./chat-view/chat-view.component";
import { ConversationFormComponent } from "./chat-view/conversation-form/conversation-form.component";
import { TagInputModule } from "ngx-chips";
import { ParticipantViewComponent } from "./chat-view/participant-view/participant-view.component";

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    CourseCardComponent,
    TopbarComponent,
    CourseViewComponent,
    LogInComponent,
    CardComponent,
    InvitationCardComponent,
    CourseFormComponent,
    AnnouncementFormComponent,
    AssignmentFormComponent,
    DiscussionFormComponent,
    RegistrationComponent,
    AdminViewComponent,
    AnnouncementViewComponent,
    AssignmentViewComponent,
    DiscussionViewComponent,
    AnnouncementCommentFormComponent,
    DiscussionCommentFormComponent,
    SubmissionViewComponent,
    QuizFormComponent,
    QuizViewComponent,
    QuestionFormComponent,
    QuizTakingViewComponent,
    ParticipationsViewComponent,
    UserDetailsViewComponent,
    ChatViewComponent,
    ConversationFormComponent,
    ParticipantViewComponent,
  ],
  entryComponents: [
    CourseFormComponent,
    AnnouncementFormComponent,
    AssignmentFormComponent,
    DiscussionFormComponent,
    AnnouncementCommentFormComponent,
    DiscussionCommentFormComponent,
    QuizFormComponent,
    QuestionFormComponent,
    ConversationFormComponent,
    ParticipantViewComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    Ng2SmartTableModule,
    ReactiveFormsModule,
    QuillModule.forRoot(),
    TagInputModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
