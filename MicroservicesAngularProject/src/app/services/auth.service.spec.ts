import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const TOKEN_KEY = 'auth_token';
  const USERNAME_KEY = 'auth_username';
  const REGISTER_URL = 'http://localhost:9191/api/auth/register';
  const TOKEN_URL = 'http://localhost:9191/api/auth/token';

  // Build an (unsigned) JWT whose payload carries exp (in seconds) and an optional role.
  function makeToken(payload: object): string {
    return `header.${btoa(JSON.stringify(payload))}.signature`;
  }
  function tokenWithExpIn(seconds: number, role?: string): string {
    const exp = Math.floor(Date.now() / 1000) + seconds;
    return makeToken(role ? { exp, role } : { exp });
  }

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('register should POST the registration payload to the auth endpoint', () => {
    service.register('alice', 'a@example.com', 'secret1', 'USER').subscribe();

    const req = httpMock.expectOne(REGISTER_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      userName: 'alice',
      email: 'a@example.com',
      password: 'secret1',
      role: 'USER'
    });
    req.flush({});
  });

  it('login should POST credentials as text and store token + username on success', () => {
    const token = tokenWithExpIn(3600);

    let received: string | undefined;
    service.login('bob', 'pw').subscribe(t => (received = t));

    const req = httpMock.expectOne(TOKEN_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userName: 'bob', password: 'pw' });
    expect(req.request.responseType).toBe('text');
    req.flush(token);

    expect(received).toBe(token);
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe(token);
    expect(sessionStorage.getItem(USERNAME_KEY)).toBe('bob');
  });

  it('login should not store anything when the response token is empty', () => {
    service.login('bob', 'pw').subscribe();
    httpMock.expectOne(TOKEN_URL).flush('');

    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(USERNAME_KEY)).toBeNull();
  });

  it('getToken / getUsername should read from sessionStorage', () => {
    sessionStorage.setItem(TOKEN_KEY, 'abc');
    sessionStorage.setItem(USERNAME_KEY, 'carol');
    expect(service.getToken()).toBe('abc');
    expect(service.getUsername()).toBe('carol');
  });

  it('getToken / getUsername should return null when nothing is stored', () => {
    expect(service.getToken()).toBeNull();
    expect(service.getUsername()).toBeNull();
  });

  it('isLoggedIn should be false when there is no token', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('isLoggedIn should be true for a non-expired token', () => {
    sessionStorage.setItem(TOKEN_KEY, tokenWithExpIn(3600));
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('isLoggedIn should be false for an expired token', () => {
    sessionStorage.setItem(TOKEN_KEY, tokenWithExpIn(-10));
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('isLoggedIn should be false for a malformed token', () => {
    sessionStorage.setItem(TOKEN_KEY, 'not-a-jwt');
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('getRole should return the role claim from the token', () => {
    sessionStorage.setItem(TOKEN_KEY, tokenWithExpIn(3600, 'ADMIN'));
    expect(service.getRole()).toBe('ADMIN');
  });

  it('getRole should return null when there is no token', () => {
    expect(service.getRole()).toBeNull();
  });

  it('getRole should return null for a malformed token', () => {
    sessionStorage.setItem(TOKEN_KEY, 'bad');
    expect(service.getRole()).toBeNull();
  });

  it('getRole should return null when the role claim is missing', () => {
    sessionStorage.setItem(TOKEN_KEY, tokenWithExpIn(3600));
    expect(service.getRole()).toBeNull();
  });

  it('isAdmin should be true only for the ADMIN role', () => {
    sessionStorage.setItem(TOKEN_KEY, tokenWithExpIn(3600, 'ADMIN'));
    expect(service.isAdmin()).toBeTrue();
  });

  it('isAdmin should be false for a non-admin role', () => {
    sessionStorage.setItem(TOKEN_KEY, tokenWithExpIn(3600, 'USER'));
    expect(service.isAdmin()).toBeFalse();
  });

  ['ADMIN', 'USER', 'MODERATOR'].forEach(role => {
    it(`isUserRole should be true for ${role}`, () => {
      sessionStorage.setItem(TOKEN_KEY, tokenWithExpIn(3600, role));
      expect(service.isUserRole()).toBeTrue();
    });
  });

  it('isUserRole should be false for GUEST', () => {
    sessionStorage.setItem(TOKEN_KEY, tokenWithExpIn(3600, 'GUEST'));
    expect(service.isUserRole()).toBeFalse();
  });

  it('isUserRole should be false when there is no token', () => {
    expect(service.isUserRole()).toBeFalse();
  });

  it('logout should clear the session and navigate to root', () => {
    sessionStorage.setItem(TOKEN_KEY, 'x');
    sessionStorage.setItem(USERNAME_KEY, 'y');

    service.logout();

    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(USERNAME_KEY)).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('resetInactivityTimer should do nothing when not logged in', () => {
    service.resetInactivityTimer();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should not log out immediately after logging in with a valid token', () => {
    service.login('bob', 'pw').subscribe();
    httpMock.expectOne(TOKEN_URL).flush(tokenWithExpIn(3600));

    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(service.getToken()).not.toBeNull();
  });

  it('should log out immediately if the issued token is already expired', () => {
    service.login('bob', 'pw').subscribe();
    httpMock.expectOne(TOKEN_URL).flush(tokenWithExpIn(-10));

    // startInactivityTimer sees a non-positive remaining time and logs out at once.
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    expect(service.getToken()).toBeNull();
  });
});
