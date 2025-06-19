import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReomendacionIAComponent } from './reomendacion-ia.component';

describe('ReomendacionIAComponent', () => {
  let component: ReomendacionIAComponent;
  let fixture: ComponentFixture<ReomendacionIAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReomendacionIAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReomendacionIAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
