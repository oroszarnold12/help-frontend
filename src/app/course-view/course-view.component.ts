import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AlertController,
  IonSegment,
  IonSlides,
  ModalController,
} from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CourseFormComponent } from "../dashboard/course-form/course-form.component";
import { Course } from "../model/course.model";
import { GeneralOverview } from "../model/general-overview.model";
import { InvitationCreation } from "../model/invitation.creation.model";
import { ThinPerson } from "../model/thin.person.model";
import { AuthService } from "../shared/auth.service";
import { BackButtonService } from "../shared/back-button.service";
import { CourseService } from "../shared/course.service";
import { DefaultSlideService } from "../shared/default-slide.service";
import { GradeService } from "../shared/grade.service";
import { InvitationService } from "../shared/invitation.service";
import { PersonService } from "../shared/person.service";
import { QuizService } from "../shared/quiz.service";
import { ToasterService } from "../shared/toaster.service";
import { AnnouncementFormComponent } from "./announcement-form/announcement-form.component";
import { AssignmentFormComponent } from "./assignment-form/assignment-form.component";
import { DiscussionFormComponent } from "./discussion-form/discussion-form.component";
import { QuizFormComponent } from "./quiz-form/quiz-form.component";
import { Grades } from "../model/grades.model";
import { PathService } from "../shared/path.service";

@Component({
  selector: "app-course-view",
  templateUrl: "./course-view.component.html",
  styleUrls: ["./course-view.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CourseViewComponent implements OnInit {
  stop: Subject<void> = new Subject();
  course: Course;
  @ViewChild("slides") slides: IonSlides;
  @ViewChild("segments") segments: IonSegment;
  options = {
    speed: 400,
    initialSlide: this.defaultSlideService.getDefaultSlide(),
  };

  assignmentOverviews: GeneralOverview[];
  announcementOverviews: GeneralOverview[];
  discussionOverviews: GeneralOverview[];
  quizOverviews: GeneralOverview[];
  gradeOverviews: any[];
  originalGradeOverviews: any[];
  thinPersons: ThinPerson[];
  personsToInvite: ThinPerson[];

  settings: any;
  availablePersonsSettings: any;
  personsToInviteSettings: any;
  defaultSlide: number;

  isTeacher: boolean;
  canDelete: boolean;

  grades: Grades;

  sumOfGrades: number;
  sumOfPoints: number;
  precentage: number;

  edited: boolean;

  constructor(
    private backButtonService: BackButtonService,
    private route: ActivatedRoute,
    private courseService: CourseService,
    private toasterService: ToasterService,
    private datePite: DatePipe,
    private defaultSlideService: DefaultSlideService,
    private modalController: ModalController,
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router,
    private personService: PersonService,
    private invitationService: InvitationService,
    private gradeService: GradeService,
    private quizService: QuizService,
    private pathService: PathService
  ) {
    this.settings = {
      actions: {
        add: false,
        edit: true,
        delete: false,
        columnTitle: "",
      },
      edit: {
        confirmSave: true,
        saveButtonContent: '<i class="bi bi-check2"></i>',
        cancelButtonContent: '<i class="bi bi-x"></i>',
        editButtonContent: '<i class="bi bi-pencil-square"></i>',
      },
      columns: {
        name: {
          title: "Name",
          filter: false,
          editable: false,
        },
        grade: {
          title: "Grade",
          filter: false,
          type: "html",
          editable: true,
          valuePrepareFunction: (value, row) => {
            if (!!row.assingmentId) {
              if (value === this.getGrade(row.assignmentId)) {
                return value;
              } else {
                return `<div class="edited">${value}</div>`;
              }
            } else {
              if (value === this.getQuizGrade(row.quizId)) {
                return value;
              } else {
                return `<div class="edited">${value}</div>`;
              }
            }
          },
        },
        points: {
          title: "Points",
          filter: false,
          editable: false,
        },
      },
    };

    this.availablePersonsSettings = {
      selectMode: "multi",
      actions: {
        add: false,
        edit: false,
        delete: false,
      },
      columns: {
        name: {
          title: "Name",
          editable: false,
          valuePrepareFunction: (cell, row) => {
            return row.firstName + " " + row.lastName;
          },
        },
        email: {
          title: "Email address",
          filter: false,
        },
      },
    };

    this.defaultSlide = defaultSlideService.getDefaultSlide();
    this.personsToInvite = [];
  }

  ngOnInit() {
    this.edited = false;
    this.backButtonService.turnOn();
    this.loadCourse();
    this.isTeacher = this.authService.isTeacher();
    if (this.isTeacher) {
      this.loadPersons();
    }
  }

  ngOnDestroy(): void {
    this.backButtonService.turnOff();
    this.stop.next();
    this.stop.complete();
  }

  loadPersons() {
    this.personService
      .getPersons()
      .pipe(takeUntil(this.stop))
      .subscribe(({ persons }) => {
        this.thinPersons = persons;
      });
  }

  loadCourse(): void {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseService
        .getCourse(params.id)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (course) => {
            this.course = course;
            this.pathService.setPath(this.course.name);
            this.canDelete =
              this.course.teacher.email === this.authService.getUsername();
            this.createAnnouncementOverviews();
            this.createDiscussionOverviews();
            this.createQuizOverviews();
            this.loadGrades();
          },
          (error) => {
            this.toasterService.error("Course not found!", "Selection failed!");
          }
        );
    });
  }

  loadGrades() {
    this.gradeService
      .getGradesOfAllAssignments(this.course.id)
      .pipe(takeUntil(this.stop))
      .subscribe((grades) => {
        this.grades = grades;
        this.createAssignmentOverviews();
        this.createGradeOverviews();
      });
  }

  createAssignmentOverviews() {
    const { assignments } = this.course;
    this.assignmentOverviews = assignments.map((assignment) => ({
      id: assignment.id,
      name: assignment.name + (assignment.published ? "" : " - Unpublished"),
      description: `Due: ${this.datePite.transform(
        new Date(assignment.dueDate),
        "medium"
      )} | 
        ${this.createAssingmentDescription(assignment.id, assignment.points)}`,
    }));
  }

  createQuizOverviews() {
    const { quizzes } = this.course;
    this.quizOverviews = quizzes.map((quiz) => ({
      id: quiz.id,
      name: quiz.name + (quiz.published ? "" : " - Unpublished"),
      description: `Due: ${this.datePite.transform(
        new Date(quiz.dueDate),
        "medium"
      )} | Points: ${quiz.points}`,
    }));
  }

  createAssingmentDescription(id: number, points: number) {
    const grade = this.grades.assignmentGrades.find(
      (grade) => grade.assignment.id === id
    );
    return !!grade ? `Grade: ${grade.grade}/${points}` : "Not yet graded!";
  }

  private stripHtml(text) {
    var div = document.createElement("div");
    div.innerHTML = text;
    return div.textContent || div.innerText || "";
  }

  createAnnouncementOverviews() {
    const { announcements } = this.course;
    this.announcementOverviews = announcements.map((announcement) => ({
      id: announcement.id,
      name: announcement.name,
      description: `${this.stripHtml(announcement.content).slice(0, 30)}... | 
      Date: ${this.datePite.transform(new Date(announcement.date), "medium")} `,
    }));
  }

  createGradeOverviews() {
    const { assignments } = this.course;
    this.gradeOverviews = assignments.map((assignment) => ({
      name: assignment.name,
      grade: this.getGrade(assignment.id),
      points: assignment.points,
      assingmentId: assignment.id,
    }));

    const { quizzes } = this.course;
    quizzes.forEach((quiz) => {
      this.gradeOverviews.push({
        name: quiz.name,
        grade: this.getQuizGrade(quiz.id),
        points: quiz.points,
        quizId: quiz.id,
      });
    });

    this.calculateTotal();
  }

  createDiscussionOverviews() {
    const { discussions } = this.course;
    this.discussionOverviews = discussions.map((discussion) => ({
      id: discussion.id,
      name: discussion.name,
      description: `Date: ${this.datePite.transform(
        new Date(discussion.date),
        "medium"
      )}`,
      creatorUsername: discussion.creator.email,
    }));
  }

  calculateTotal() {
    this.sumOfPoints = 0;
    this.sumOfGrades = 0;
    this.gradeOverviews.forEach((gradeOverview) => {
      this.sumOfPoints += gradeOverview.points;
      const grade = gradeOverview.grade;
      if (grade !== "-") {
        this.sumOfGrades += grade;
      }
    });

    this.precentage = (this.sumOfGrades * 100) / this.sumOfPoints;
  }

  getGrade(assignmentId) {
    const grade = this.grades.assignmentGrades.find(
      (grade) => grade.assignment.id === assignmentId
    );
    return !!grade ? grade.grade : "-";
  }

  getQuizGrade(quizId) {
    const grade = this.grades.quizGrades.find(
      (grade) => grade.quiz.id === quizId
    );
    return !!grade ? grade.grade : "-";
  }

  segmentChanged(event) {
    this.slides.slideTo(event.detail.value);
  }

  ionSlideDidChange(): void {
    this.slides.getActiveIndex().then((index) => {
      this.segments.value = index.toString();
      document.getElementById("segment-" + index).scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "center",
      });
    });
  }

  viewAnnouncement(event) {
    this.router.navigate([`/courses/${this.course.id}/announcements/${event}`]);
    this.pathService.setPath(`${this.course.name}/Announcements`);
  }

  viewAssignment(event) {
    this.router.navigate([`/courses/${this.course.id}/assignments/${event}`]);
    this.pathService.setPath(`${this.course.name}/Assignments`);
  }

  viewQuiz(event) {
    this.router.navigate([`/courses/${this.course.id}/quizzes/${event}`]);
    this.pathService.setPath(`${this.course.name}/Quizzes`);
  }

  viewDiscussion(event) {
    this.router.navigate([`/courses/${this.course.id}/discussions/${event}`]);
    this.pathService.setPath(`${this.course.name}/Discussions`);
  }

  async deleteAnnouncement(event) {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this announcement?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.courseService
              .deleteAnnouncement(this.course.id, event)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Announcement deletion successful!",
                    "Congratulations!"
                  );
                  this.loadCourse();
                },
                (error) => {
                  this.toasterService.error(
                    error.error.message,
                    "Please try again!"
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteAssignment(event) {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this assignment?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.courseService
              .deleteAssignment(this.course.id, event)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Assignment deletion successful!",
                    "Congratulations!"
                  );
                  this.loadCourse();
                },
                (error) => {
                  this.toasterService.error(
                    error.error.message,
                    "Please try again!"
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteQuiz(event) {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this quiz?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.quizService
              .deleteQuiz(this.course.id, event)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Quiz deletion successful!",
                    "Congratulations!"
                  );
                  this.loadCourse();
                },
                (error) => {
                  this.toasterService.error(
                    error.error.message,
                    "Please try again!"
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteDiscussion(event) {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this discussion?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.courseService
              .deleteDiscussions(this.course.id, event)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Discussion deletion successful!",
                    "Congratulations!"
                  );
                  this.loadCourse();
                },
                (error) => {
                  this.toasterService.error(
                    error.error.message,
                    "Please try again!"
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteCourse() {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this course?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.courseService
              .deleteCourse(this.course.id)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Course deletion successful!",
                    "Congratulations!"
                  );
                  this.router.navigate(["/dashboard"]);
                },

                (error) => {
                  this.toasterService.error(
                    "Course deletion failed!",
                    "Please try again!"
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  async presentAnnouncementModal() {
    const modal = await this.modalController.create({
      component: AnnouncementFormComponent,
      componentProps: {
        courseId: this.course.id,
      },
    });

    modal.onDidDismiss().then(() => this.loadCourse());

    await modal.present();
  }

  async presentAssignmentModal() {
    const modal = await this.modalController.create({
      component: AssignmentFormComponent,
      componentProps: {
        courseId: this.course.id,
      },
    });

    modal.onDidDismiss().then(() => this.loadCourse());

    await modal.present();
  }

  async presentQuizModal() {
    const modal = await this.modalController.create({
      component: QuizFormComponent,
      componentProps: {
        courseId: this.course.id,
      },
    });

    modal.onDidDismiss().then(() => this.loadCourse());

    await modal.present();
  }

  async presentDiscussionModal() {
    const modal = await this.modalController.create({
      component: DiscussionFormComponent,
      componentProps: {
        courseId: this.course.id,
      },
    });

    modal.onDidDismiss().then(() => this.loadCourse());

    await modal.present();
  }

  async presentCourseModal() {
    const modal = await this.modalController.create({
      component: CourseFormComponent,
      componentProps: {
        course: this.course,
      },
    });

    modal.onDidDismiss().then(() => this.loadCourse());

    await modal.present();
  }

  onUserRowSelected(event) {
    this.personsToInvite = event.selected;
  }

  inviteClicked() {
    if (this.personsToInvite.length) {
      const invitations: InvitationCreation = {};
      invitations.courseId = this.course.id;
      invitations.emails = [];
      this.personsToInvite.forEach((person) => {
        invitations.emails.push(person.email);
      });
      this.invitationService
        .saveInvitation(invitations)
        .pipe(takeUntil(this.stop))
        .subscribe(
          () => {
            this.toasterService.success(
              "Invitations sent!",
              "Congratulations!"
            );
          },
          (error) => {
            console.log(error);
            this.toasterService.error(
              error.error,
              "Sending invitations failed!"
            );
          }
        );
    } else {
      this.toasterService.error(
        "The invitation list must contain atleast one person!",
        "Sending invitations failed!"
      );
    }
  }

  onEditConfirmed(event) {
    this.edited = true;

    event.newData.grade = Number.parseFloat(event.newData.grade);
    event.confirm.resolve(event.newData);

    const oldGrade = event.data.grade === "-" ? 0 : event.data.grade;

    this.sumOfGrades = this.sumOfGrades - (oldGrade - event.newData.grade);
    this.precentage = (this.sumOfGrades * 100) / this.sumOfPoints;
  }

  onResetClicked() {
    this.createGradeOverviews();
    this.edited = false;
  }
}
