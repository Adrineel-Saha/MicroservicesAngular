import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { SignupComponent } from './signup.component';
import { AuthService } from '../../services/auth.service';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;

  const validForm = {
    username: 'alice',
    email: 'alice@example.com',
    password: 'secret1',
    confirmPassword: 'secret1',
    role: 'USER'
  };

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SignupComponent],
      providers: [
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // runs ngOnInit -> builds the form
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build an invalid, empty form on init', () => {
    expect(component.signupForm).toBeDefined();
    expect(component.signupForm.invalid).toBeTrue();
  });

  it('should be valid with well-formed values', () => {
    component.signupForm.setValue(validForm);
    expect(component.signupForm.valid).toBeTrue();
  });

  it('should flag an invalid email', () => {
    component.emailControl.setValue('not-an-email');
    expect(component.emailControl.errors?.['email']).toBeTruthy();
  });

  it('should flag a missing role', () => {
    component.roleControl.setValue('');
    expect(component.roleControl.errors?.['required']).toBeTruthy();
  });

  it('checkSignup should not register when the form is invalid', () => {
    component.signupForm.reset(); // empty -> invalid
    component.checkSignup();
    expect(authSpy.register).not.toHaveBeenCalled();
  });

  it('checkSignup should detect a password mismatch and not register', () => {
    component.signupForm.setValue({ ...validForm, confirmPassword: 'different1' });

    component.checkSignup();

    expect(component.passwordMismatch).toBeTrue();
    expect(authSpy.register).not.toHaveBeenCalled();
  });

  it('checkSignup should register and show a success message on success', () => {
    authSpy.register.and.returnValue(of({}));
    component.signupForm.setValue(validForm);

    component.checkSignup();

    expect(authSpy.register).toHaveBeenCalledWith('alice', 'alice@example.com', 'secret1', 'USER');
    expect(component.successMessage).toBe('Account created successfully! You can now log in.');
    expect(component.errorMessage).toBe('');
    expect(component.passwordMismatch).toBeFalse();
    expect(component.signupForm.value.username).toBeNull(); // form was reset
  });

  it('checkSignup should show an error message on failure', () => {
    authSpy.register.and.returnValue(throwError(() => new Error('taken')));
    component.signupForm.setValue(validForm);

    component.checkSignup();

    expect(component.errorMessage).toBe('Registration failed. Username or email may already be taken.');
    expect(component.successMessage).toBe('');
  });

  it('goToLogin should flip the auth service out of signup mode', () => {
    component.goToLogin();
    expect(authSpy.showSignup).toBeFalse();
  });
});
