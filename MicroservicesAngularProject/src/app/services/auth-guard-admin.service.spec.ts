import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthGuardAdminService } from './auth-guard-admin.service';
import { AuthService } from './auth.service';

describe('AuthGuardAdminService', () => {
  let guard: AuthGuardAdminService;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'isAdmin']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuardAdminService,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
    guard = TestBed.inject(AuthGuardAdminService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation for a logged-in admin', () => {
    authSpy.isLoggedIn.and.returnValue(true);
    authSpy.isAdmin.and.returnValue(true);

    expect(guard.canActivate()).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should block activation and redirect when not logged in', () => {
    authSpy.isLoggedIn.and.returnValue(false);

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should block activation and redirect for a logged-in non-admin', () => {
    authSpy.isLoggedIn.and.returnValue(true);
    authSpy.isAdmin.and.returnValue(false);

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
