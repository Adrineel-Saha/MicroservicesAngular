import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { ListOrdersByUserComponent } from './list-orders-by-user.component';
import { OrderService } from 'src/app/services/order.service';
import { MockOrders } from 'src/app/mockdata/order.mock';

describe('ListOrdersByUserComponent', () => {
  let component: ListOrdersByUserComponent;
  let fixture: ComponentFixture<ListOrdersByUserComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;

  beforeEach(async () => {
    orderServiceSpy = jasmine.createSpyObj('OrderService', ['listOrdersByUser']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ListOrdersByUserComponent],
      providers: [{ provide: OrderService, useValue: orderServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ListOrdersByUserComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    nativeElement = debugElement.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize an invalid empty form on init', () => {
    expect(component.submitted).toBeFalse();
    expect(component.isUserIdAbsent).toBeFalse();
    expect(component.userIdForm.valid).toBeFalse();
  });

  it('should reject a userId below 1', () => {
    component.userIdControl.setValue(0);
    expect(component.userIdControl.hasError('min')).toBeTrue();
  });

  it('completes the whole search flow: enter a userId, submit, and render the results table', () => {
    orderServiceSpy.listOrdersByUser.and.returnValue(of(new HttpResponse({ body: MockOrders, status: 200 })));

    const searchUserId = MockOrders[0].userId;
    const input = debugElement.query(By.css('#userId')).nativeElement as HTMLInputElement;
    input.value = String(searchUserId);
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submit = debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(submit.disabled).toBeFalse();
    submit.click();
    fixture.detectChanges();

    expect(orderServiceSpy.listOrdersByUser).toHaveBeenCalledWith(searchUserId);
    expect(component.submitted).toBeTrue();
    const rows = debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(MockOrders.length);
    expect((rows[0].nativeElement as HTMLElement).textContent).toContain(MockOrders[0].status);
  });

  it('should load orders and set submitted=true on success', () => {
    orderServiceSpy.listOrdersByUser.and.returnValue(of(new HttpResponse({ body: MockOrders, status: 200 })));

    component.userIdForm.setValue({ userId: 1 });
    component.onSubmit();

    expect(orderServiceSpy.listOrdersByUser).toHaveBeenCalledWith(1);
    expect(component.orders).toEqual(MockOrders);
    expect(component.submitted).toBeTrue();
  });

  it('should default to an empty array when the response body is null', () => {
    orderServiceSpy.listOrdersByUser.and.returnValue(of(new HttpResponse<any>({ body: null, status: 200 })));

    component.userIdForm.setValue({ userId: 1 });
    component.onSubmit();

    expect(component.orders).toEqual([]);
  });

  it('should set isUserIdAbsent on a 400 then clear it after 2s', fakeAsync(() => {
    orderServiceSpy.listOrdersByUser.and.returnValue(throwError(() => ({ status: 400 })));

    component.userIdForm.setValue({ userId: 99 });
    component.onSubmit();

    expect(component.isUserIdAbsent).toBeTrue();
    tick(2000);
    expect(component.isUserIdAbsent).toBeFalse();
  }));

  it('should not flag absence for non-400 errors', () => {
    orderServiceSpy.listOrdersByUser.and.returnValue(throwError(() => ({ status: 500 })));

    component.userIdForm.setValue({ userId: 1 });
    component.onSubmit();

    expect(component.isUserIdAbsent).toBeFalse();
    expect(component.submitted).toBeFalse();
  });

  it('should render the heading via debugElement', () => {
    const heading = debugElement.query(By.css('h3'));
    expect((heading.nativeElement as HTMLElement).textContent).toContain('List Orders By Users');
  });

  it('should render a single userId input and keep submit disabled until valid', () => {
    const input = debugElement.query(By.css('#userId'));
    expect(input).toBeTruthy();
    expect(nativeElement.querySelector('#userId')).toBe(input.nativeElement);

    const button = debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(button.disabled).toBeTrue();

    component.userIdForm.setValue({ userId: 1 });
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();
  });

  it('should render a table row per order after a successful search', () => {
    orderServiceSpy.listOrdersByUser.and.returnValue(of(new HttpResponse({ body: MockOrders, status: 200 })));

    component.userIdForm.setValue({ userId: 1 });
    component.onSubmit();
    fixture.detectChanges();

    const rows = debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(MockOrders.length);
    expect((rows[0].nativeElement as HTMLElement).textContent).toContain(MockOrders[0].status);
  });

  const shownMessages = (): string[] =>
    debugElement.queryAll(By.css('p')).map(p => ((p.nativeElement as HTMLElement).textContent ?? '').trim());

  it('should render the min message for a non-positive userId and clear it when valid', () => {
    component.userIdControl.setValue(0);
    component.userIdControl.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('User_Id should be positive');

    component.userIdControl.setValue(1);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('User_Id should be positive');
  });
});
