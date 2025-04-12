import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuenoComponent } from './sueno.component';

describe('SuenoComponent', () => {
  let component: SuenoComponent;
  let fixture: ComponentFixture<SuenoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuenoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuenoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
