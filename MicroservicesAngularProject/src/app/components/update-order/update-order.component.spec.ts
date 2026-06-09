import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UpdateOrderComponent } from './update-order.component';
import { OrderService } from 'src/app/services/order.service';
import { MockOrders } from 'src/app/mockdata/order.mock';

describe('UpdateOrderComponent', () => {
  let component: UpdateOrderComponent;
  let fixture: ComponentFixture<UpdateOrderComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;

  const mockOrder = MockOrders[0];

  beforeEach(async () => {
    orderServiceSpy = jasmine.createSpyObj('OrderService', ['getOrder', 'updateOrderStatus']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [UpdateOrderComponent],
      providers: [{ provide: OrderService, useValue: orderServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateOrderComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    nativeElement = debugElement.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with reset flags and invalid forms', () => {
    expect(component.showFormInitial).toBeFalse();
    expect(component.showForm).toBeFalse();
    expect(component.submitted).toBeFalse();
    expect(component.isOrderAbsent).toBeFalse();
    expect(component.orderIdForm.valid).toBeFalse();
    expect(component.updateOrderStatusForm.valid).toBeFalse();
  });

  it('should reject an invalid status value', () => {
    component.statusControl.setValue('BOGUS');
    expect(component.statusControl.hasError('pattern')).toBeTrue();
    component.statusControl.setValue(mockOrder.status);
    expect(component.statusControl.valid).toBeTrue();
  });

  it('onUpdate should fetch the order and patch the form', () => {
    orderServiceSpy.getOrder.and.returnValue(of(new HttpResponse({ body: mockOrder, status: 200 })));

    component.orderIdForm.setValue({ orderId: mockOrder.id });
    component.onUpdate();

    expect(orderServiceSpy.getOrder).toHaveBeenCalledWith(mockOrder.id);
    expect(component.orderId).toBe(mockOrder.id);
    expect(component.showFormInitial).toBeTrue();
    expect(component.updateOrderStatusForm.get('status')?.value).toBe(mockOrder.status);
  });

  it('onUpdate should flag a missing order on 404 and clear it after 2s', fakeAsync(() => {
    orderServiceSpy.getOrder.and.returnValue(throwError(() => ({ status: 404 })));

    component.orderIdForm.setValue({ orderId: 99 });
    component.onUpdate();

    expect(component.isOrderAbsent).toBeTrue();
    tick(2000);
    expect(component.isOrderAbsent).toBeFalse();
  }));

  it('onSubmit should update the order status and set the success flags', () => {
    orderServiceSpy.updateOrderStatus.and.returnValue(of(new HttpResponse({ body: mockOrder, status: 202 })));

    component.orderId = mockOrder.id;
    component.updateOrderStatusForm.setValue(mockOrder);
    component.onSubmit();

    expect(orderServiceSpy.updateOrderStatus).toHaveBeenCalledWith(mockOrder.id, mockOrder.status);
    expect(component.showForm).toBeTrue();
    expect(component.submitted).toBeTrue();
  });

  it('onSubmit should not set success flags when the service errors', () => {
    orderServiceSpy.updateOrderStatus.and.returnValue(throwError(() => ({ status: 500 })));

    component.orderId = mockOrder.id;
    component.updateOrderStatusForm.setValue(mockOrder);
    component.onSubmit();

    expect(component.showForm).toBeFalse();
    expect(component.submitted).toBeFalse();
  });

  it('should render the heading via debugElement', () => {
    const heading = debugElement.query(By.css('h3'));
    expect((heading.nativeElement as HTMLElement).textContent).toContain('Update an existing Order');
  });

  it('should render the lookup input and keep the Update Order button disabled until valid', () => {
    const input = debugElement.query(By.css('#orderId'));
    expect(input).toBeTruthy();
    expect(nativeElement.querySelector('#orderId')).toBe(input.nativeElement);

    const button = debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(button.textContent?.trim()).toBe('Update Order');
    expect(button.disabled).toBeTrue();

    component.orderIdForm.setValue({ orderId: mockOrder.id });
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();
  });

  it('should populate the status input after a successful lookup', () => {
    orderServiceSpy.getOrder.and.returnValue(of(new HttpResponse({ body: mockOrder, status: 200 })));

    component.orderIdForm.setValue({ orderId: mockOrder.id });
    component.onUpdate();
    fixture.detectChanges();

    const statusInput = debugElement.query(By.css('#status')).nativeElement as HTMLInputElement;
    expect(statusInput.value).toBe(mockOrder.status);
  });
});
