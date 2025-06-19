import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculadoraNutricionalComponent } from './calculadora-nutricional.component';

describe('CalculadoraNutricionalComponent', () => {
  let component: CalculadoraNutricionalComponent;
  let fixture: ComponentFixture<CalculadoraNutricionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculadoraNutricionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculadoraNutricionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
