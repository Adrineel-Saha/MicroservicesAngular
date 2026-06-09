import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { CreateOrderItemComponent } from './create-order-item.component';
import { OrderService } from 'src/app/services/order.service';
import { MockOrderItems } from 'src/app/mockdata/order-item.mock';

describe('CreateOrderItemComponent', () => {
  let component: CreateOrderItemComponent;
  let fixture: ComponentFixture<CreateOrderItemComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;

  const mockItem = MockOrderItems[0];

  beforeEach(async () => {
    orderServiceSpy = jasmine.createSpyObj('OrderService', ['addItem']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CreateOrderItemComponent],
      providers: [{ provide: OrderService, useValue: orderServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrderItemComponent);
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
    expect(component.orderItemForm.valid).toBeFalse();
  });

  it('should reject a quantity below 1', () => {
    component.quantityControl.setValue(0);
    expect(component.quantityControl.hasError('min')).toBeTrue();
    component.quantityControl.setValue(mockItem.quantity);
    expect(component.quantityControl.valid).toBeTrue();
  });

  it('should be valid with proper values', () => {
    component.orderItemForm.patchValue(mockItem);
    expect(component.orderItemForm.valid).toBeTrue();
  });

  it('should call addItem and set submitted=true on success', () => {
    orderServiceSpy.addItem.and.returnValue(of(new HttpResponse({ body: mockItem, status: 201 })));

    component.orderItemForm.patchValue(mockItem);
    component.onSubmit();

    expect(orderServiceSpy.addItem).toHaveBeenCalled();
    expect(component.submitted).toBeTrue();
  });

  it('should not set submitted=true when the service errors', () => {
    orderServiceSpy.addItem.and.returnValue(throwError(() => ({ status: 400 })));

    component.orderItemForm.patchValue(mockItem);
    component.onSubmit();

    expect(component.submitted).toBeFalse();
  });

  it('should render the heading via debugElement', () => {
    const heading = debugElement.query(By.css('h3'));
    expect((heading.nativeElement as HTMLElement).textContent).toContain('Add a New Order Item');
  });

  it('should render the productId, quantity and orderId inputs', () => {
    const inputs = debugElement.queryAll(By.css('input'));
    expect(inputs.length).toBe(3);
    expect(debugElement.query(By.css('#productId'))).toBeTruthy();
    expect(nativeElement.querySelector('#quantity')).toBeTruthy();
  });

  it('should keep the submit button disabled until the form is valid', () => {
    const button = debugElement.query(By.css('button[type="submit"]'));
    const buttonElement = button.nativeElement as HTMLButtonElement;
    expect(buttonElement.textContent?.trim()).toBe('Submit');
    expect(buttonElement.disabled).toBeTrue();

    component.orderItemForm.patchValue(mockItem);
    fixture.detectChanges();
    expect(buttonElement.disabled).toBeFalse();
  });

  it('should show a validation message once productId is touched and blank', () => {
    component.productIdControl.markAsTouched();
    fixture.detectChanges();
    const texts = debugElement.queryAll(By.css('p')).map(p => (p.nativeElement as HTMLElement).textContent?.trim());
    expect(texts).toContain('Product_Id cannot be blank');
  });
});
