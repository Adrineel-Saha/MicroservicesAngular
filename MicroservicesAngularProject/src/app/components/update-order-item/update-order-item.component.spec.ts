import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UpdateOrderItemComponent } from './update-order-item.component';
import { OrderService } from 'src/app/services/order.service';
import { MockOrderItems } from 'src/app/mockdata/order-item.mock';

describe('UpdateOrderItemComponent', () => {
  let component: UpdateOrderItemComponent;
  let fixture: ComponentFixture<UpdateOrderItemComponent>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;

  const mockItem = MockOrderItems[0];

  beforeEach(async () => {
    orderServiceSpy = jasmine.createSpyObj('OrderService', ['getItem', 'updateItem']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [UpdateOrderItemComponent],
      providers: [{ provide: OrderService, useValue: orderServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateOrderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with reset flags and invalid forms', () => {
    expect(component.showFormInitial).toBeFalse();
    expect(component.showForm).toBeFalse();
    expect(component.submitted).toBeFalse();
    expect(component.isItemAbsent).toBeFalse();
    expect(component.itemIdForm.valid).toBeFalse();
    expect(component.updateOrderItemForm.valid).toBeFalse();
  });

  it('onUpdate should fetch the item and patch the form', () => {
    orderServiceSpy.getItem.and.returnValue(of(new HttpResponse({ body: mockItem, status: 200 })));

    component.itemIdForm.setValue({ itemId: mockItem.id });
    component.onUpdate();

    expect(orderServiceSpy.getItem).toHaveBeenCalledWith(mockItem.id);
    expect(component.itemId).toBe(mockItem.id);
    expect(component.showFormInitial).toBeTrue();
    expect(component.updateOrderItemForm.get('productId')?.value).toBe(mockItem.productId);
    expect(component.updateOrderItemForm.get('quantity')?.value).toBe(mockItem.quantity);
  });

  it('onUpdate should flag a missing item on 404 and clear it after 2s', fakeAsync(() => {
    orderServiceSpy.getItem.and.returnValue(throwError(() => ({ status: 404 })));

    component.itemIdForm.setValue({ itemId: 99 });
    component.onUpdate();

    expect(component.isItemAbsent).toBeTrue();
    tick(2000);
    expect(component.isItemAbsent).toBeFalse();
  }));

  it('onSubmit should update the item and set the success flags', () => {
    orderServiceSpy.updateItem.and.returnValue(of(new HttpResponse({ body: mockItem, status: 202 })));

    component.itemId = mockItem.id;
    component.updateOrderItemForm.setValue(mockItem);
    component.onSubmit();

    expect(orderServiceSpy.updateItem).toHaveBeenCalledWith(mockItem.id, mockItem as any);
    expect(component.showForm).toBeTrue();
    expect(component.submitted).toBeTrue();
  });

  it('onSubmit should not set success flags when the service errors', () => {
    orderServiceSpy.updateItem.and.returnValue(throwError(() => ({ status: 500 })));

    component.itemId = mockItem.id;
    component.updateOrderItemForm.setValue(mockItem);
    component.onSubmit();

    expect(component.showForm).toBeFalse();
    expect(component.submitted).toBeFalse();
  });
});
