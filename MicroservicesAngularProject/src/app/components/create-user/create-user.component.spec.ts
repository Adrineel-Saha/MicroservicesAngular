import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { CreateUserComponent } from './create-user.component';
import { UserService } from 'src/app/services/user.service';
import { MockUsers } from 'src/app/mockdata/user.mock';

describe('CreateUserComponent', () => {
  let component: CreateUserComponent;
  let fixture: ComponentFixture<CreateUserComponent>;
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

  it('should require userName to be at least 3 characters', () => {
    component.userNameControl.setValue('ab');
    expect(component.userNameControl.valid).toBeFalse();
    component.userNameControl.setValue(mockUser.userName);
    expect(component.userNameControl.hasError('minlength')).toBeFalse();
  });

  it('should reject an invalid email pattern', () => {
    component.emailControl.setValue('not-an-email');
    expect(component.emailControl.hasError('pattern')).toBeTrue();
    component.emailControl.setValue(mockUser.email);
    expect(component.emailControl.valid).toBeTrue();
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
});
