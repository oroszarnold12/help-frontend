import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { CourseViewComponent } from "./course-view/course-view.component";
import { LogInComponent } from "./log-in/log-in.component";
import { GuardService } from "./guards/guard.service";

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
  },
  {
    path: "courses/:id",
    component: CourseViewComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
