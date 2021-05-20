import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-retry-page',
  templateUrl: './retry-page.component.html',
  styleUrls: ['./retry-page.component.scss'],
})
export class RetryPageComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {}

  retryClicked(): void {
    this.authService.pingBackend().subscribe(() => {
      window.location.reload();
    });
  }
}
