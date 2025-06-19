import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitosRecomendadosComponent } from './habitos-recomendados.component';

describe('HabitosRecomendadosComponent', () => {
  let component: HabitosRecomendadosComponent;
  let fixture: ComponentFixture<HabitosRecomendadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitosRecomendadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitosRecomendadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
