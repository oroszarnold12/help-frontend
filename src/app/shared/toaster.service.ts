import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: "root",
})
export class ToasterService {
  constructor(private toastrService: ToastrService) {}

  success(
    message?: string,
    title: string = "Success",
    timeInMs: number = 3000
  ) {
    this.toastrService.success(message, title, { timeOut: timeInMs });
  }

  error(message?: string, title: string = "Error", timeInMs: number = 3000) {
    this.toastrService.error(message, title, { timeOut: timeInMs });
  }

  warning(
    message?: string,
    title: string = "Warning",
    timeInMs: number = 3000
  ) {
    this.toastrService.warning(message, title, { timeOut: timeInMs });
  }

  info(message?: string, title: string = "Info", timeInMs: number = 3000) {
    this.toastrService.info(message, title, { timeOut: timeInMs });
  }
}
