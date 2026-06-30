import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Entrenar } from './entrenar';

describe('Entrenar', () => {
  let component: Entrenar;
  let fixture: ComponentFixture<Entrenar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Entrenar],
    }).compileComponents();

    fixture = TestBed.createComponent(Entrenar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
