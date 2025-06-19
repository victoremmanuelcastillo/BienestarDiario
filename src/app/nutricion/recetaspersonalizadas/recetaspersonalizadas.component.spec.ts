import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetaspersonalizadasComponent } from './recetaspersonalizadas.component';

describe('RecetaspersonalizadasComponent', () => {
  let component: RecetaspersonalizadasComponent;
  let fixture: ComponentFixture<RecetaspersonalizadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetaspersonalizadasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecetaspersonalizadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
