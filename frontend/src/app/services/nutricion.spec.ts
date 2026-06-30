import { TestBed } from '@angular/core/testing';

import { Nutricion } from './nutricion';

describe('Nutricion', () => {
  let service: Nutricion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Nutricion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
