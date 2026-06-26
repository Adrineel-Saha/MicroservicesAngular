import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let debugElement: DebugElement;
  let authStub: {
    showSignup: boolean;
    isLoggedIn: jasmine.Spy;
    resetInactivityTimer: jasmine.Spy;
  };

  beforeEach(async () => {
    authStub = {
      showSignup: false,
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(false),
      resetInactivityTimer: jasmine.createSpy('resetInactivityTimer')
    };

    // NO_ERRORS_SCHEMA lets us assert on <app-navigation>/<app-login>/<app-signup>
    // without declaring those child components.
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [{ provide: AuthService, useValue: authStub }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'MicroservicesAngularProject'`, () => {
    expect(component.title).toEqual('MicroservicesAngularProject');
  });

  it('should show the navigation and router outlet when logged in', () => {
    authStub.isLoggedIn.and.returnValue(true);
    fixture.detectChanges();

    expect(debugElement.query(By.css('app-navigation'))).toBeTruthy();
    expect(debugElement.query(By.css('router-outlet'))).toBeTruthy();
    expect(debugElement.query(By.css('app-login'))).toBeNull();
    expect(debugElement.query(By.css('app-signup'))).toBeNull();
  });

  it('should host a single navigation component when logged in', () => {
    authStub.isLoggedIn.and.returnValue(true);
    fixture.detectChanges();

    expect(debugElement.queryAll(By.css('app-navigation')).length).toBe(1);
  });

  it('should show the login view when logged out and not signing up', () => {
    authStub.isLoggedIn.and.returnValue(false);
    authStub.showSignup = false;
    fixture.detectChanges();

    expect(debugElement.query(By.css('app-login'))).toBeTruthy();
    expect(debugElement.query(By.css('app-signup'))).toBeNull();
    expect(debugElement.query(By.css('app-navigation'))).toBeNull();
  });

  it('should show the signup view when logged out and signup is requested', () => {
    authStub.isLoggedIn.and.returnValue(false);
    authStub.showSignup = true;
    fixture.detectChanges();

    expect(debugElement.query(By.css('app-signup'))).toBeTruthy();
    expect(debugElement.query(By.css('app-login'))).toBeNull();
    expect(debugElement.query(By.css('app-navigation'))).toBeNull();
  });

  it('should forward user activity to the auth service', () => {
    component.onUserActivity();
    expect(authStub.resetInactivityTimer).toHaveBeenCalled();
  });
});
