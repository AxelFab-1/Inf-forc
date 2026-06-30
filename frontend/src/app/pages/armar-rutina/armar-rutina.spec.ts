import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArmarRutina } from './armar-rutina';

describe('ArmarRutina', () => {
  let component: ArmarRutina;
  let fixture: ComponentFixture<ArmarRutina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArmarRutina],
    }).compileComponents();

    fixture = TestBed.createComponent(ArmarRutina);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
