import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeditacionGuiadaComponent } from './meditacion-guiada.component';

describe('MeditacionGuiadaComponent', () => {
  let component: MeditacionGuiadaComponent;
  let fixture: ComponentFixture<MeditacionGuiadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeditacionGuiadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeditacionGuiadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
