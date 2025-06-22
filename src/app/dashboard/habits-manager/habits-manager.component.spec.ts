import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitsManagerComponent } from './habits-manager.component';

describe('HabitsManagerComponent', () => {
  let component: HabitsManagerComponent;
  let fixture: ComponentFixture<HabitsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitsManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
