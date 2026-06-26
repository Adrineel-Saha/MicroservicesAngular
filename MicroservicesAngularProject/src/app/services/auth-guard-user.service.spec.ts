import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthGuardUserService } from './auth-guard-user.service';
import { AuthService } from './auth.service';

describe('AuthGuardUserService', () => {
  let guard: AuthGuardUserService;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'isUserRole']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuardUserService,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
    guard = TestBed.inject(AuthGuardUserService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation for a logged-in user with an allowed role', () => {
    authSpy.isLoggedIn.and.returnValue(true);
    authSpy.isUserRole.and.returnValue(true);

    expect(guard.canActivate()).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should block activation and redirect when not logged in', () => {
    authSpy.isLoggedIn.and.returnValue(false);

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should block activation and redirect for a disallowed role (e.g. GUEST)', () => {
    authSpy.isLoggedIn.and.returnValue(true);
    authSpy.isUserRole.and.returnValue(false);

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
