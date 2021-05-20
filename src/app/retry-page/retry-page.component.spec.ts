import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RetryPageComponent } from './retry-page.component';

describe('RetryPageComponent', () => {
  let component: RetryPageComponent;
  let fixture: ComponentFixture<RetryPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetryPageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RetryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
