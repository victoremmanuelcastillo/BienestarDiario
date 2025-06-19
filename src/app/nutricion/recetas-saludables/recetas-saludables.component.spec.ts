import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetasSaludablesComponent } from './recetas-saludables.component';

describe('RecetasSaludablesComponent', () => {
  let component: RecetasSaludablesComponent;
  let fixture: ComponentFixture<RecetasSaludablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetasSaludablesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecetasSaludablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
