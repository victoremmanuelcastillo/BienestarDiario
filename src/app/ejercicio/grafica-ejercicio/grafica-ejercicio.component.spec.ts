import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficaEjercicioComponent } from './grafica-ejercicio.component';

describe('GraficaEjercicioComponent', () => {
  let component: GraficaEjercicioComponent;
  let fixture: ComponentFixture<GraficaEjercicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficaEjercicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficaEjercicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
