import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficasNutricionComponent } from './graficas-nutricion.component';

describe('GraficasNutricionComponent', () => {
  let component: GraficasNutricionComponent;
  let fixture: ComponentFixture<GraficasNutricionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficasNutricionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficasNutricionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
