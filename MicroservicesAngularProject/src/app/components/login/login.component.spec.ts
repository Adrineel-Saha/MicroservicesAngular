import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // runs ngOnInit -> builds the form
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build an invalid, empty form on init', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.invalid).toBeTrue();
    expect(component.loginForm.value).toEqual({ username: '', password: '' });
  });

  it('should be valid with a proper username and password', () => {
    component.loginForm.setValue({ username: 'bob', password: 'secret1' });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should flag a required username', () => {
    component.usernameControl.setValue('');
    expect(component.usernameControl.errors?.['required']).toBeTruthy();
  });

  it('should flag a too-short username', () => {
    component.usernameControl.setValue('ab');
    expect(component.usernameControl.errors?.['minlength']).toBeTruthy();
  });

  it('should flag a too-short password', () => {
    component.passwordControl.setValue('123');
    expect(component.passwordControl.errors?.['minlength']).toBeTruthy();
  });

  it('checkLogin should not call the auth service when the form is invalid', () => {
    component.loginForm.setValue({ username: '', password: '' });
    component.checkLogin();
    expect(authSpy.login).not.toHaveBeenCalled();
  });

  it('checkLogin should log in and navigate home on success', () => {
    authSpy.login.and.returnValue(of('a.token.value'));
    component.loginForm.setValue({ username: 'bob', password: 'secret1' });

    component.checkLogin();

    expect(authSpy.login).toHaveBeenCalledWith('bob', 'secret1');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    expect(component.errorMessage).toBe('');
  });

  it('checkLogin should set an error message and not navigate on failure', () => {
    authSpy.login.and.returnValue(throwError(() => new Error('bad credentials')));
    component.loginForm.setValue({ username: 'bob', password: 'wrongpw' });

    component.checkLogin();

    expect(component.errorMessage).toBe('Invalid username or password. Please try again.');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('goToSignup should flip the auth service into signup mode', () => {
    component.goToSignup();
    expect(authSpy.showSignup).toBeTrue();
  });
});
