import { TestBed } from '@angular/core/testing';

import { LogoutComponent } from './logout.component';

describe('LogoutComponent', () => {
  let component: LogoutComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LogoutComponent]
    });
    component = TestBed.createComponent(LogoutComponent).componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
