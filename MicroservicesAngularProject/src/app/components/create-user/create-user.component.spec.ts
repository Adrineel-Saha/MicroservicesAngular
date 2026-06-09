import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { CreateUserComponent } from './create-user.component';
import { UserService } from 'src/app/services/user.service';
import { MockUsers } from 'src/app/mockdata/user.mock';

describe('CreateUserComponent', () => {
  let component: CreateUserComponent;
  let fixture: ComponentFixture<CreateUserComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockUser = MockUsers[0];

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['createUser']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CreateUserComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUserComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    nativeElement = debugElement.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty controls on init', () => {
    expect(component.submitted).toBeFalse();
    expect(component.userForm).toBeDefined();
    expect(component.userForm.get('userName')?.value).toBe('');
    expect(component.userForm.get('email')?.value).toBe('');
  });

  it('should mark the form invalid when empty', () => {
    expect(component.userForm.valid).toBeFalse();
  });

  it('should reject a userName shorter than 3 characters', () => {
    component.userNameControl.setValue('ab');
    expect(component.userNameControl.hasError('minlength')).toBeTrue();
  });

  it('should reject an invalid email pattern', () => {
    component.emailControl.setValue('not-an-email');
    expect(component.emailControl.hasError('pattern')).toBeTrue();
  });

  it('should be valid with proper values', () => {
    component.userForm.patchValue(mockUser);
    expect(component.userForm.valid).toBeTrue();
  });

  it('should call createUser and set submitted=true on success', () => {
    userServiceSpy.createUser.and.returnValue(of(new HttpResponse({ body: mockUser, status: 201 })));

    component.userForm.patchValue(mockUser);
    component.onSubmit();

    expect(userServiceSpy.createUser).toHaveBeenCalled();
    expect(component.submitted).toBeTrue();
  });

  it('should reset the form after a successful submit', () => {
    userServiceSpy.createUser.and.returnValue(of(new HttpResponse<any>({ body: null, status: 201 })));

    component.userForm.patchValue(mockUser);
    component.onSubmit();

    expect(component.userForm.get('userName')?.value).toBeNull();
    expect(component.userForm.get('email')?.value).toBeNull();
  });

  it('should not set submitted=true when the service errors', () => {
    userServiceSpy.createUser.and.returnValue(throwError(() => ({ status: 400 })));

    component.userForm.patchValue(mockUser);
    component.onSubmit();

    expect(component.submitted).toBeFalse();
  });

  it('should render the heading via debugElement', () => {
    const heading = debugElement.query(By.css('h3'));
    expect((heading.nativeElement as HTMLElement).textContent).toContain('Add a New User');
  });

  it('should render the userName and email inputs', () => {
    const inputs = debugElement.queryAll(By.css('input'));
    expect(inputs.length).toBe(2);
    expect(debugElement.query(By.css('#userName'))).toBeTruthy();
    expect(nativeElement.querySelector('#email')).toBeTruthy();
  });

  it('should keep the submit button disabled until the form is valid', () => {
    const button = debugElement.query(By.css('button[type="submit"]'));
    const buttonElement = button.nativeElement as HTMLButtonElement;
    expect(buttonElement.textContent?.trim()).toBe('Submit');
    expect(buttonElement.disabled).toBeTrue();

    component.userForm.patchValue(mockUser);
    fixture.detectChanges();
    expect(buttonElement.disabled).toBeFalse();
  });

  const shownMessages = (): string[] =>
    debugElement.queryAll(By.css('p')).map(p => ((p.nativeElement as HTMLElement).textContent ?? '').trim());

  it('should render the minlength message for a too-short userName and clear it when valid', () => {
    component.userNameControl.setValue('ab');
    component.userNameControl.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('User_Name must be atleast 3 characters long');

    component.userNameControl.setValue(mockUser.userName);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('User_Name must be atleast 3 characters long');
  });

  it('should render the pattern message for an invalid email and clear it when valid', () => {
    component.emailControl.setValue('not-an-email');
    component.emailControl.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('Please enter a valid email');

    component.emailControl.setValue(mockUser.email);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('Please enter a valid email');
  });

  it('should render the required message when userName is blank and clear it when filled', () => {
    component.userNameControl.setValue('');
    component.userNameControl.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('User_Name cannot be blank');

    component.userNameControl.setValue(mockUser.userName);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('User_Name cannot be blank');
  });

  it('completes the whole create-user flow: fill the form, submit, and show success', () => {
    userServiceSpy.createUser.and.returnValue(of(new HttpResponse({ body: mockUser, status: 201 })));

    const userNameInput = debugElement.query(By.css('#userName')).nativeElement as HTMLInputElement;
    const emailInput = debugElement.query(By.css('#email')).nativeElement as HTMLInputElement;
    userNameInput.value = mockUser.userName;
    userNameInput.dispatchEvent(new Event('input'));
    emailInput.value = mockUser.email;
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submit = debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(submit.disabled).toBeFalse();
    submit.click();
    fixture.detectChanges();

    expect(userServiceSpy.createUser).toHaveBeenCalledWith(
      jasmine.objectContaining({ userName: mockUser.userName, email: mockUser.email })
    );
    expect(component.submitted).toBeTrue();
    const success = debugElement.query(By.css('h4')).nativeElement as HTMLElement;
    expect(success.textContent).toContain('User Added Successfully!');
    expect((success.parentElement as HTMLElement).hidden).toBeFalse();
  });
});
