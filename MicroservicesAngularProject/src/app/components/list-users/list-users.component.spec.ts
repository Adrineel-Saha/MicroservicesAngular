import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { ListUsersComponent } from './list-users.component';
import { UserService } from 'src/app/services/user.service';
import { MockUsers } from 'src/app/mockdata/user.mock';

describe('ListUsersComponent', () => {
  let component: ListUsersComponent;
  let fixture: ComponentFixture<ListUsersComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getAllUsers']);
    userServiceSpy.getAllUsers.and.returnValue(of(new HttpResponse({ body: MockUsers, status: 200 })));

    await TestBed.configureTestingModule({
      declarations: [ListUsersComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ListUsersComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    nativeElement = debugElement.nativeElement as HTMLElement;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load all users on init', () => {
    fixture.detectChanges();
    expect(userServiceSpy.getAllUsers).toHaveBeenCalled();
    expect(component.users).toEqual(MockUsers);
    expect(component.users.length).toBe(5);
  });

  it('should render a table row for every user', () => {
    fixture.detectChanges();
    const rows = debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(MockUsers.length);
  });

  it('should render each user name in a row cell', () => {
    fixture.detectChanges();
    const rows = debugElement.queryAll(By.css('tbody tr'));
    rows.forEach((row, index) => {
      const rowElement = row.nativeElement as HTMLElement;
      expect(rowElement.textContent).toContain(MockUsers[index].userName);
    });
  });

  it('should not render any data rows before users load', () => {
    userServiceSpy.getAllUsers.and.returnValue(throwError(() => ({ status: 400 })));
    fixture.detectChanges();
    expect(debugElement.query(By.css('tbody tr'))).toBeNull();
    expect(nativeElement.querySelector('tbody tr')).toBeNull();
  });

  it('should default to an empty array when the response body is null', () => {
    userServiceSpy.getAllUsers.and.returnValue(of(new HttpResponse<any>({ body: null, status: 200 })));
    fixture.detectChanges();
    expect(component.users).toEqual([]);
  });

  it('should leave users unset when the service errors', () => {
    userServiceSpy.getAllUsers.and.returnValue(throwError(() => ({ status: 400 })));
    fixture.detectChanges();
    expect(component.users).toBeUndefined();
  });
});
