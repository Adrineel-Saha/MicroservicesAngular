import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UpdateUserComponent } from './update-user.component';
import { UserService } from 'src/app/services/user.service';
import { MockUsers } from 'src/app/mockdata/user.mock';

describe('UpdateUserComponent', () => {
  let component: UpdateUserComponent;
  let fixture: ComponentFixture<UpdateUserComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockUser = MockUsers[0];

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUser', 'updateUser']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [UpdateUserComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateUserComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    nativeElement = debugElement.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with both forms and flags reset', () => {
    expect(component.showFormInitial).toBeFalse();
    expect(component.showForm).toBeFalse();
    expect(component.submitted).toBeFalse();
    expect(component.isUserIdAbsent).toBeFalse();
    expect(component.isEmailExists).toBeFalse();
    expect(component.userIdForm.valid).toBeFalse();
    expect(component.updateUserForm.valid).toBeFalse();
  });

  it('onUpdate should fetch the user and patch the update form', () => {
    userServiceSpy.getUser.and.returnValue(of(new HttpResponse({ body: mockUser, status: 200 })));

    component.userIdForm.setValue({ userId: mockUser.id });
    component.onUpdate();

    expect(userServiceSpy.getUser).toHaveBeenCalledWith(mockUser.id);
    expect(component.userId).toBe(mockUser.id);
    expect(component.showFormInitial).toBeTrue();
    expect(component.updateUserForm.get('userName')?.value).toBe(mockUser.userName);
    expect(component.updateUserForm.get('email')?.value).toBe(mockUser.email);
  });

  it('onUpdate should flag a missing user on 404 and clear it after 2s', fakeAsync(() => {
    userServiceSpy.getUser.and.returnValue(throwError(() => ({ status: 404 })));

    component.userIdForm.setValue({ userId: 99 });
    component.onUpdate();

    expect(component.isUserIdAbsent).toBeTrue();
    tick(2000);
    expect(component.isUserIdAbsent).toBeFalse();
  }));

  it('onSubmit should update the user and set the success flags', () => {
    userServiceSpy.updateUser.and.returnValue(of(new HttpResponse({ body: mockUser, status: 202 })));

    component.userId = mockUser.id;
    component.updateUserForm.setValue(mockUser);
    component.onSubmit();

    expect(userServiceSpy.updateUser).toHaveBeenCalledWith(mockUser.id, mockUser as any);
    expect(component.showForm).toBeTrue();
    expect(component.submitted).toBeTrue();
  });

  it('onSubmit should flag a duplicate email on a 400 and clear it after 2s', fakeAsync(() => {
    userServiceSpy.updateUser.and.returnValue(
      throwError(() => ({ status: 400, error: 'User Already Exists with Email Id: ' + mockUser.email }))
    );

    component.userId = mockUser.id;
    component.updateUserForm.setValue(mockUser);
    component.onSubmit();

    expect(component.isEmailExists).toBeTrue();
    expect(component.submitted).toBeFalse();
    tick(2000);
    expect(component.isEmailExists).toBeFalse();
  }));

  it('should render the heading via debugElement', () => {
    const heading = debugElement.query(By.css('h3'));
    expect((heading.nativeElement as HTMLElement).textContent).toContain('Update an existing User');
  });

  it('should render the lookup input and keep the Update User button disabled until valid', () => {
    const input = debugElement.query(By.css('#userId'));
    expect(input).toBeTruthy();
    expect(nativeElement.querySelector('#userId')).toBe(input.nativeElement);

    const button = debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(button.textContent?.trim()).toBe('Update User');
    expect(button.disabled).toBeTrue();

    component.userIdForm.setValue({ userId: mockUser.id });
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();
  });

  it('should populate the edit form inputs after a successful lookup', () => {
    userServiceSpy.getUser.and.returnValue(of(new HttpResponse({ body: mockUser, status: 200 })));

    component.userIdForm.setValue({ userId: mockUser.id });
    component.onUpdate();
    fixture.detectChanges();

    const userNameInput = debugElement.query(By.css('#userName')).nativeElement as HTMLInputElement;
    const emailInput = debugElement.query(By.css('#email')).nativeElement as HTMLInputElement;
    expect(userNameInput.value).toBe(mockUser.userName);
    expect(emailInput.value).toBe(mockUser.email);
  });
});
