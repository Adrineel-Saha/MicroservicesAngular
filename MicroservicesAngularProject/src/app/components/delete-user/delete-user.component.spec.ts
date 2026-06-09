import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { DeleteUserComponent } from './delete-user.component';
import { UserService } from 'src/app/services/user.service';
import { MockUsers } from 'src/app/mockdata/user.mock';

describe('DeleteUserComponent', () => {
  let component: DeleteUserComponent;
  let fixture: ComponentFixture<DeleteUserComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockUser = MockUsers[0];

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['deleteUser']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [DeleteUserComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteUserComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    nativeElement = debugElement.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with reset flags and an invalid form', () => {
    expect(component.submitted).toBeFalse();
    expect(component.userIdForm.valid).toBeFalse();
  });

  it('should reject a userId below 1', () => {
    component.userIdControl.setValue(0);
    expect(component.userIdControl.hasError('min')).toBeTrue();
  });

  it('should delete the user and capture the result on success', () => {
    const message = 'User deleted with Id: ' + mockUser.id;
    userServiceSpy.deleteUser.and.returnValue(of(new HttpResponse({ body: message, status: 200 })));

    component.userIdForm.setValue({ userId: mockUser.id });
    component.onSubmit();

    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(mockUser.id);
    expect(component.result).toBe(message);
    expect(component.submitted).toBeTrue();
  });

  it('should set isUserIdAbsent on a 404 then clear it after 2s', fakeAsync(() => {
    userServiceSpy.deleteUser.and.returnValue(throwError(() => ({ status: 404 })));

    component.userIdForm.setValue({ userId: 99 });
    component.onSubmit();

    expect(component.isUserIdAbsent).toBeTrue();
    expect(component.submitted).toBeFalse();
    tick(2000);
    expect(component.isUserIdAbsent).toBeFalse();
  }));

  it('should not flag absence for non-404 errors', () => {
    userServiceSpy.deleteUser.and.returnValue(throwError(() => ({ status: 500 })));

    component.userIdForm.setValue({ userId: mockUser.id });
    component.onSubmit();

    expect(component.isUserIdAbsent).toBeFalse();
    expect(component.submitted).toBeFalse();
  });

  it('should render the heading via debugElement', () => {
    const heading = debugElement.query(By.css('h3'));
    expect((heading.nativeElement as HTMLElement).textContent).toContain('Delete an existing User');
  });

  it('should render a single userId input', () => {
    const inputs = debugElement.queryAll(By.css('input'));
    expect(inputs.length).toBe(1);
    expect(nativeElement.querySelector('#userId')).toBeTruthy();
  });

  it('should keep the danger button disabled until the form is valid', () => {
    const button = debugElement.query(By.css('button[type="submit"]'));
    const buttonElement = button.nativeElement as HTMLButtonElement;
    expect(buttonElement.textContent?.trim()).toBe('Delete User');
    expect(buttonElement.classList).toContain('btn-danger');
    expect(buttonElement.disabled).toBeTrue();

    component.userIdForm.setValue({ userId: mockUser.id });
    fixture.detectChanges();
    expect(buttonElement.disabled).toBeFalse();
  });

  it('should render the result message after a successful delete', () => {
    const message = 'User deleted with Id: ' + mockUser.id;
    userServiceSpy.deleteUser.and.returnValue(of(new HttpResponse({ body: message, status: 200 })));

    component.userIdForm.setValue({ userId: mockUser.id });
    component.onSubmit();
    fixture.detectChanges();

    const result = debugElement.query(By.css('h4'));
    expect((result.nativeElement as HTMLElement).textContent).toContain(message);
  });

  const shownMessages = (): string[] =>
    debugElement.queryAll(By.css('p')).map(p => ((p.nativeElement as HTMLElement).textContent ?? '').trim());

  it('should render the min message for a non-positive userId and clear it when valid', () => {
    component.userIdControl.setValue(0);
    component.userIdControl.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('User_Id should be positive');

    component.userIdControl.setValue(mockUser.id);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('User_Id should be positive');
  });

  it('completes the whole delete-user flow: enter id, delete, and show the result', () => {
    const message = 'User deleted with Id: ' + mockUser.id;
    userServiceSpy.deleteUser.and.returnValue(of(new HttpResponse({ body: message, status: 200 })));

    const idInput = debugElement.query(By.css('#userId')).nativeElement as HTMLInputElement;
    idInput.value = String(mockUser.id);
    idInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submit = debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(submit.disabled).toBeFalse();
    submit.click();
    fixture.detectChanges();

    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(mockUser.id);
    expect(component.submitted).toBeTrue();
    const result = debugElement.query(By.css('h4')).nativeElement as HTMLElement;
    expect(result.textContent).toContain(message);
    expect((result.parentElement as HTMLElement).hidden).toBeFalse();
  });
});
