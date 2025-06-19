import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroModalComponent } from './intro-habitos.component';

describe('IntroModalComponent', () => {
  let component: IntroModalComponent;
  let fixture: ComponentFixture<IntroModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntroModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntroModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
