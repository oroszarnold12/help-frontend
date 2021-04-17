import { DatePipe, formatNumber } from "@angular/common";
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
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
import { CourseFile } from "../model/course-file.model";
import { FileSaverService } from "ngx-filesaver";

@Component({
  selector: "app-course-view",
  templateUrl: "./course-view.component.html",
  styleUrls: ["./course-view.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CourseViewComponent implements OnInit, OnDestroy {
  stop: Subject<void> = new Subject();
  course: Course;
  canDelete: boolean;
  isTeacher: boolean;

  @ViewChild("slides") slides: IonSlides;
  @ViewChild("segments") segments: IonSegment;
  options = {
    speed: 400,
    initialSlide: this.defaultSlideService.getDefaultSlide(),
  };
  defaultSlide: number;

  assignmentOverviews: GeneralOverview[];
  announcementOverviews: GeneralOverview[];
  discussionOverviews: GeneralOverview[];
  quizOverviews: GeneralOverview[];
  gradeOverviews: any[];
  originalGradeOverviews: any[];

  thinPersons: ThinPerson[];
  participants: ThinPerson[];
  personsToInvite: ThinPerson[];
  gradeTableSettings: any;
  availablePersonsTableSettings: any;
  participantsTableSettings: any;

  grades: Grades;
  sumOfGrades: number;
  sumOfPoints: number;
  precentage: number;
  editedGrade: boolean;

  uploadingCourseFile: boolean;
  numOfCourseFiles: number = 1;
  private courseFiles: Blob[];
  courseFilesTableSettings: any;
  courseFilesToDownload: CourseFile[];

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
    private fileSaverService: FileSaverService
  ) {
    this.gradeTableSettings = {
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
            if (!!row.assignmentId) {
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

    this.availablePersonsTableSettings = {
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

    this.participantsTableSettings = {
      actions: {
        add: false,
        edit: false,
        delete: this.isTeacher,
        columnTitle: "",
      },
      delete: {
        confirmDelete: true,
        deleteButtonContent: '<i class="bi bi-slash-circle danger"></i>',
      },
      columns: {
        name: {
          title: "Name",
          editable: false,
          type: "string",
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

    this.isTeacher = this.authService.isTeacher();

    this.courseFilesTableSettings = {
      selectMode: "multi",
      actions: {
        add: false,
        edit: false,
        delete: this.isTeacher,
        columnTitle: "",
      },
      delete: {
        confirmDelete: true,
        deleteButtonContent: '<i class="bi bi-trash danger"></i>',
      },
      columns: {
        fileName: {
          title: "Name",
        },
        creationDate: {
          title: "Creation Date",
          filter: false,
          valuePrepareFunction: (cell, row) => {
            return datePite.transform(cell, "medium");
          },
        },
        size: {
          title: "Size",
          filter: false,
          valuePrepareFunction: (cell, row) => {
            return formatNumber(cell / 1000000, "en-EN") + " Mb";
          },
        },
        uploader: {
          title: "Creator",
          filter: false,
          valuePrepareFunction: (cell, row) => {
            return cell.firstName + " " + cell.lastName;
          },
        },
      },
    };

    this.defaultSlide = defaultSlideService.getDefaultSlide();
    this.personsToInvite = [];
  }

  ngOnInit(): void {
    this.editedGrade = false;
    this.uploadingCourseFile = false;
    this.backButtonService.turnOn();
    this.loadCourse();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadPersons(): void {
    this.personService
      .getPersons()
      .pipe(takeUntil(this.stop))
      .subscribe(
        ({ persons }) => {
          this.thinPersons = persons;

          this.thinPersons = this.thinPersons.filter((person) => {
            return (
              this.participants.filter((participant) => {
                return participant.id === person.id;
              }).length === 0
            );
          });
        },
        (error) => {
          this.toasterService.error(
            error.error.message,
            "Something went wrong!"
          );
        }
      );
  }

  loadCourse(): void {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseService
        .getCourse(params.courseId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (course) => {
            this.course = course;
            this.canDelete =
              this.course.teacher.email === this.authService.getUsername();
            this.createAnnouncementOverviews();
            this.createDiscussionOverviews();
            this.createQuizOverviews();
            this.loadGrades();
            this.loadParticipants();
          },
          (error) => {
            this.toasterService.error(
              error.error.message,
              "Something went wrong!"
            );
          }
        );
    });
  }

  loadGrades(): void {
    this.gradeService
      .getGradesOfAllAssignments(this.course.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (grades) => {
          this.grades = grades;
          this.createAssignmentOverviews();
          this.createGradeOverviews();
        },
        (error) => {
          this.toasterService.error(
            error.error.message,
            "Something went wrong!"
          );
        }
      );
  }

  loadParticipants(): void {
    this.courseService
      .getParticipants(this.course.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (participants) => {
          this.participants = participants;
          if (this.isTeacher) {
            this.loadPersons();
          }
        },
        (error) => {
          this.toasterService.error(
            error.error.message,
            "Something went wrong!"
          );
        }
      );
  }

  createAssignmentOverviews(): void {
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

  createAssingmentDescription(id: number, points: number): string {
    const grade = this.grades.assignmentGrades.find(
      (grade) => grade.assignment.id === id
    );
    return !!grade ? `Grade: ${grade.grade}/${points}` : "Not yet graded!";
  }

  createQuizOverviews(): void {
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

  createAnnouncementOverviews(): void {
    const { announcements } = this.course;
    this.announcementOverviews = announcements.map((announcement) => ({
      id: announcement.id,
      name: announcement.name,
      description: `${this.stripHtml(announcement.content).slice(0, 30)}... | 
      Date: ${this.datePite.transform(new Date(announcement.date), "medium")} `,
    }));
  }

  private stripHtml(text: string): string {
    var div = document.createElement("div");
    div.innerHTML = text;
    return div.textContent || div.innerText || "";
  }

  createGradeOverviews(): void {
    const { assignments } = this.course;
    this.gradeOverviews = assignments.map((assignment) => ({
      name: assignment.name,
      grade: this.getGrade(assignment.id),
      points: assignment.points,
      assignmentId: assignment.id,
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

  calculateTotal(): void {
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

  getGrade(assignmentId: number): number | string {
    const grade = this.grades.assignmentGrades.find(
      (grade) => grade.assignment.id === assignmentId
    );
    return !!grade ? grade.grade : "-";
  }

  getQuizGrade(quizId: number): number | string {
    const grade = this.grades.quizGrades.find(
      (grade) => grade.quiz.id === quizId
    );
    return !!grade ? grade.grade : "-";
  }

  createDiscussionOverviews(): void {
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

  segmentChanged(event: any): void {
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

  viewAnnouncement(announcementId: number): void {
    this.router.navigate([
      `/courses/${this.course.id}/announcements/${announcementId}`,
    ]);
  }

  viewAssignment(assignmentId: number): void {
    this.router.navigate([
      `/courses/${this.course.id}/assignments/${assignmentId}`,
    ]);
  }

  viewQuiz(quizId: number): void {
    this.router.navigate([`/courses/${this.course.id}/quizzes/${quizId}`]);
  }

  viewDiscussion(discussionId: number): void {
    this.router.navigate([
      `/courses/${this.course.id}/discussions/${discussionId}`,
    ]);
  }

  async deleteAnnouncement(announcementId: number): Promise<void> {
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
              .deleteAnnouncement(this.course.id, announcementId)
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

  async deleteAssignment(assignmentId: number): Promise<void> {
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
              .deleteAssignment(this.course.id, assignmentId)
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

  async deleteQuiz(quizId: number): Promise<void> {
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
              .deleteQuiz(this.course.id, quizId)
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

  async deleteDiscussion(discussionId: number): Promise<void> {
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
              .deleteDiscussions(this.course.id, discussionId)
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

  async deleteCourse(): Promise<void> {
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

  async presentAnnouncementModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: AnnouncementFormComponent,
      cssClass: "my-custom-modal-css",
      componentProps: {
        courseId: this.course.id,
      },
    });

    modal.onDidDismiss().then(() => this.loadCourse());

    await modal.present();
  }

  async presentAssignmentModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: AssignmentFormComponent,
      cssClass: "my-custom-modal-css",
      componentProps: {
        courseId: this.course.id,
      },
    });

    modal.onDidDismiss().then(() => this.loadCourse());

    await modal.present();
  }

  async presentQuizModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: QuizFormComponent,
      cssClass: "my-custom-modal-css",
      componentProps: {
        courseId: this.course.id,
      },
    });

    modal.onDidDismiss().then(() => this.loadCourse());

    await modal.present();
  }

  async presentDiscussionModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: DiscussionFormComponent,
      cssClass: "my-custom-modal-css",
      componentProps: {
        courseId: this.course.id,
      },
    });

    modal.onDidDismiss().then(() => this.loadCourse());

    await modal.present();
  }

  async presentCourseModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: CourseFormComponent,
      cssClass: "my-custom-modal-css",
      componentProps: {
        course: this.course,
      },
    });

    modal.onDidDismiss().then(() => this.loadCourse());

    await modal.present();
  }

  onUserRowSelected(event: any): void {
    this.personsToInvite = event.selected;
  }

  inviteClicked(): void {
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

  onEditConfirmed(event: any): void {
    this.editedGrade = true;

    event.newData.grade = Number.parseFloat(event.newData.grade);
    event.confirm.resolve(event.newData);

    const oldGrade = event.data.grade === "-" ? 0 : event.data.grade;

    this.sumOfGrades = this.sumOfGrades - (oldGrade - event.newData.grade);
    this.precentage = (this.sumOfGrades * 100) / this.sumOfPoints;
  }

  onResetClicked(): void {
    this.createGradeOverviews();
    this.editedGrade = false;
  }

  onUploadFilesClicked(): void {
    this.uploadingCourseFile = !this.uploadingCourseFile;
    this.courseFiles = null;
    this.numOfCourseFiles = 1;
  }

  onCourseFileChange(fileChangeEvent: any, index: number): void {
    if (!!!this.courseFiles) {
      this.courseFiles = [];
    }
    this.courseFiles[index] = fileChangeEvent.target.files[0];
  }

  onRemoveCourseFileClicked(): void {
    if (!!!this.courseFiles) {
      this.courseFiles = [];
    }

    this.courseFiles[this.numOfCourseFiles - 1] = null;
    if (this.numOfCourseFiles > 1) {
      this.numOfCourseFiles--;
    }
  }

  onAddAnotherCourseFileClicked(): void {
    if (this.numOfCourseFiles < 5) {
      this.numOfCourseFiles++;
    } else {
      this.toasterService.error(
        "The maximum number of files is 5!",
        "Something went wrong!"
      );
    }
  }

  uploadCourseFile(): void {
    if (!!this.courseFiles) {
      const formData = new FormData();
      this.courseFiles.forEach((file) => {
        formData.append("files", file);
      });

      this.courseService
        .saveCourseFile(this.course.id, formData)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (courseFiles) => {
            this.toasterService.success(
              "Files uploaded successfully!",
              "Congratulations!"
            );

            this.uploadingCourseFile = false;
            this.courseFiles = null;
            this.loadCourse();
          },
          (error) => {
            this.toasterService.error(error.error.message, "Please try again!");
          }
        );
    } else {
      this.toasterService.error("File is required!", "Please try again!");
    }
  }

  onCourseFileSelected(event: any): void {
    this.courseFilesToDownload = event.selected;
  }

  onCourseFilesDownloadClicked(): void {
    if (!!this.courseFilesToDownload && this.courseFilesToDownload.length > 0) {
      switch (this.courseFilesToDownload.length) {
        case 1: {
          this.downloadSingleCourseFile(
            this.courseFilesToDownload[0].id,
            this.courseFilesToDownload[0].fileName
          );
          break;
        }
        case this.course.files.length: {
          this.downloadAllCourseFiles();
          break;
        }
        default: {
          const courseFilesIds = this.courseFilesToDownload.map(
            (courseFileToDownload) => courseFileToDownload.id.toString()
          );
          this.downloadSomeCourseFiles(courseFilesIds);
          break;
        }
      }
    } else {
      this.toasterService.error("No files selected!", "Please try again!");
    }
  }

  downloadSingleCourseFile(fileId: number, fileName: string): void {
    this.courseService
      .getCourseFile(this.course.id, fileId)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (blob) => {
          this.fileSaverService.save(blob, fileName);
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }

  downloadAllCourseFiles(): void {
    this.courseService
      .getAllCourseFiles(this.course.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (blob) => {
          this.fileSaverService.save(
            blob,
            (this.course.name + "_files.zip").replace("/ +/g", "_")
          );
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }

  downloadSomeCourseFiles(courseFilesIds: string[]): void {
    this.courseService
      .getSomeCourseFiles(this.course.id, courseFilesIds)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (blob) => {
          this.fileSaverService.save(
            blob,
            (this.course.name + "_files.zip").replace("/ +/g", "_")
          );
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }

  async onCourseFileDeleteClicked(event: any): Promise<void> {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this file?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.courseService
              .deleteCourseFile(this.course.id, event.data.id)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Course file deletion successful!",
                    "Congratulations!"
                  );
                  event.confirm.resolve();
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

  async onKickParticipantClicked(event: any): Promise<void> {
    if (event.data.email === this.authService.getUsername()) {
      this.toasterService.error(
        "You can't kick yourself!",
        "Choose another participant!"
      );
    } else {
      const alert = await this.alertController.create({
        header: "Confirm!",
        message: "Are you sure that you want to kick this student?",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Yes",
            handler: () => {
              this.courseService
                .deleteParticipant(this.course.id, event.data.id)
                .pipe(takeUntil(this.stop))
                .subscribe(
                  () => {
                    this.toasterService.success(
                      "Participant kicked successfuly!",
                      "Congratulations!"
                    );

                    event.confirm.resolve();
                    this.loadParticipants();
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
  }
}
