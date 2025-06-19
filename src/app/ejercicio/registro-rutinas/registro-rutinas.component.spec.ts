import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroRutinasComponent } from './registro-rutinas.component';

describe('RegistroRutinasComponent', () => {
  let component: RegistroRutinasComponent;
  let fixture: ComponentFixture<RegistroRutinasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroRutinasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroRutinasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
