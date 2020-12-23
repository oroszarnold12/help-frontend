import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class DefaultSlideService {
  defaultSlide = 0;

  constructor() {}

  changeDefaultSlide(slide: number) {
    this.defaultSlide = slide;
  }

  getDefaultSlide(): number {
    return this.defaultSlide;
  }
}
