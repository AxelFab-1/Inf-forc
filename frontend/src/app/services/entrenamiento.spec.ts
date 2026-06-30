import { TestBed } from '@angular/core/testing';

import { Entrenamiento } from './entrenamiento';

describe('Entrenamiento', () => {
  let service: Entrenamiento;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Entrenamiento);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
