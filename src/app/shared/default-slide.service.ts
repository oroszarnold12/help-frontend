import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class DefaultSlideService {
  defaultSlide: number;

  constructor() {
    this.defaultSlide = 0;
  }

  changeDefaultSlide(slide: number): void {
    this.defaultSlide = slide;
  }

  getDefaultSlide(): number {
    return this.defaultSlide;
  }
}
