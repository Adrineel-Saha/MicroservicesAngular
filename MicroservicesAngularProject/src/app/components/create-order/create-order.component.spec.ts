import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { CreateOrderComponent } from './create-order.component';
import { OrderService } from 'src/app/services/order.service';
import { MockOrders } from 'src/app/mockdata/order.mock';

describe('CreateOrderComponent', () => {
  let component: CreateOrderComponent;
  let fixture: ComponentFixture<CreateOrderComponent>;
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

  it('should only accept a valid status value', () => {
    component.statusControl.setValue('UNKNOWN');
    expect(component.statusControl.hasError('pattern')).toBeTrue();
    component.statusControl.setValue(mockOrder.status);
    expect(component.statusControl.valid).toBeTrue();
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
});
