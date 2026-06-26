import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { CreateOrderComponent } from './create-order.component';
import { OrderService } from 'src/app/services/order.service';
import { MockOrders } from 'src/app/mockdata/order.mock';

describe('CreateOrderComponent', () => {
  let component: CreateOrderComponent;
  let fixture: ComponentFixture<CreateOrderComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;

  const mockOrder = MockOrders[0];

  beforeEach(async () => {
    orderServiceSpy = jasmine.createSpyObj('OrderService', ['createOrder']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CreateOrderComponent],
      providers: [{ provide: OrderService, useValue: orderServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrderComponent);
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
    expect(component.orderForm.valid).toBeFalse();
  });

  it('should reject a userId below 1', () => {
    component.userIdControl.setValue(0);
    expect(component.userIdControl.hasError('min')).toBeTrue();
  });

  it('should reject an invalid status value', () => {
    component.statusControl.setValue('UNKNOWN');
    expect(component.statusControl.hasError('pattern')).toBeTrue();
  });

  it('should be valid with proper values', () => {
    component.orderForm.patchValue(mockOrder);
    expect(component.orderForm.valid).toBeTrue();
  });

  it('should call createOrder and set submitted=true on success', () => {
    orderServiceSpy.createOrder.and.returnValue(of(new HttpResponse({ body: mockOrder, status: 201 })));

    component.orderForm.patchValue(mockOrder);
    component.onSubmit();

    expect(orderServiceSpy.createOrder).toHaveBeenCalled();
    expect(component.submitted).toBeTrue();
  });

  it('should not set submitted=true when the service errors', () => {
    orderServiceSpy.createOrder.and.returnValue(throwError(() => ({ status: 400 })));

    component.orderForm.patchValue(mockOrder);
    component.onSubmit();

    expect(component.submitted).toBeFalse();
  });

  it('should render the heading via debugElement', () => {
    const heading = debugElement.query(By.css('h3'));
    expect((heading.nativeElement as HTMLElement).textContent).toContain('Add a New Order');
  });

  it('should render the userId and status inputs', () => {
    const inputs = debugElement.queryAll(By.css('input'));
    expect(inputs.length).toBe(2);
    expect(debugElement.query(By.css('#userId'))).toBeTruthy();
    expect(nativeElement.querySelector('#status')).toBeTruthy();
  });

  it('should keep the submit button disabled until the form is valid', () => {
    const button = debugElement.query(By.css('button[type="submit"]'));
    const buttonElement = button.nativeElement as HTMLButtonElement;
    expect(buttonElement.textContent?.trim()).toBe('Submit');
    expect(buttonElement.disabled).toBeTrue();

    component.orderForm.patchValue(mockOrder);
    fixture.detectChanges();
    expect(buttonElement.disabled).toBeFalse();
  });

  const shownMessages = (): string[] =>
    debugElement.queryAll(By.css('p')).map(p => ((p.nativeElement as HTMLElement).textContent ?? '').trim());

  it('should render the min message for a non-positive userId and clear it when valid', () => {
    component.userIdControl.setValue(0);
    component.userIdControl.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('User_Id must be a positive number');

    component.userIdControl.setValue(mockOrder.userId);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('User_Id must be a positive number');
  });

  it('should render the pattern message for an invalid status and clear it when valid', () => {
    component.statusControl.setValue('UNKNOWN');
    component.statusControl.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('Status must be one of: CREATED, PAID, SHIPPED, CANCELLED');

    component.statusControl.setValue(mockOrder.status);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('Status must be one of: CREATED, PAID, SHIPPED, CANCELLED');
  });

  it('completes the whole create-order flow: fill the form, submit, and show success', () => {
    orderServiceSpy.createOrder.and.returnValue(of(new HttpResponse({ body: mockOrder, status: 201 })));

    const userIdInput = debugElement.query(By.css('#userId')).nativeElement as HTMLInputElement;
    const statusInput = debugElement.query(By.css('#status')).nativeElement as HTMLInputElement;
    userIdInput.value = String(mockOrder.userId);
    userIdInput.dispatchEvent(new Event('input'));
    statusInput.value = mockOrder.status;
    statusInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submit = debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(submit.disabled).toBeFalse();
    submit.click();
    fixture.detectChanges();

    expect(orderServiceSpy.createOrder).toHaveBeenCalledWith(
      jasmine.objectContaining({ userId: mockOrder.userId, status: mockOrder.status })
    );
    expect(component.submitted).toBeTrue();
    const success = debugElement.query(By.css('h4')).nativeElement as HTMLElement;
    expect(success.textContent).toContain('Order Created Successfully!');
    expect((success.parentElement as HTMLElement).hidden).toBeFalse();
  });
});
