import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeditacionComponent } from './meditacion.component';

describe('MeditacionComponent', () => {
  let component: MeditacionComponent;
  let fixture: ComponentFixture<MeditacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeditacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeditacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
