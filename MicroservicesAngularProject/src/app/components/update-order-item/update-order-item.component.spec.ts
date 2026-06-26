import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UpdateOrderItemComponent } from './update-order-item.component';
import { OrderService } from 'src/app/services/order.service';
import { MockOrderItems } from 'src/app/mockdata/order-item.mock';

describe('UpdateOrderItemComponent', () => {
  let component: UpdateOrderItemComponent;
  let fixture: ComponentFixture<UpdateOrderItemComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
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

  it('should render the heading via debugElement', () => {
    const heading = debugElement.query(By.css('h3'));
    expect((heading.nativeElement as HTMLElement).textContent).toContain('Update an existing Order Item');
  });

  it('should render the lookup input and keep the Update Item button disabled until valid', () => {
    const input = debugElement.query(By.css('#itemId'));
    expect(input).toBeTruthy();
    expect(nativeElement.querySelector('#itemId')).toBe(input.nativeElement);

    const button = debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(button.textContent?.trim()).toBe('Update Item');
    expect(button.disabled).toBeTrue();

    component.itemIdForm.setValue({ itemId: mockItem.id });
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();
  });

  it('should populate the editable inputs after a successful lookup', () => {
    orderServiceSpy.getItem.and.returnValue(of(new HttpResponse({ body: mockItem, status: 200 })));

    component.itemIdForm.setValue({ itemId: mockItem.id });
    component.onUpdate();
    fixture.detectChanges();

    const productIdInput = debugElement.query(By.css('#productId')).nativeElement as HTMLInputElement;
    const quantityInput = debugElement.query(By.css('#quantity')).nativeElement as HTMLInputElement;
    expect(productIdInput.value).toBe(String(mockItem.productId));
    expect(quantityInput.value).toBe(String(mockItem.quantity));
  });

  const shownMessages = (): string[] =>
    debugElement.queryAll(By.css('p')).map(p => ((p.nativeElement as HTMLElement).textContent ?? '').trim());

  it('should render the min message for a non-positive lookup itemId and clear it when valid', () => {
    component.itemIdControlOne.setValue(0);
    component.itemIdControlOne.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('Item_Id should be positive');

    component.itemIdControlOne.setValue(mockItem.id);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('Item_Id should be positive');
  });

  it('should render edit-form validation messages for invalid input after a lookup', () => {
    orderServiceSpy.getItem.and.returnValue(of(new HttpResponse({ body: mockItem, status: 200 })));
    component.itemIdForm.setValue({ itemId: mockItem.id });
    component.onUpdate();
    fixture.detectChanges();

    component.productIdControl.setValue(0);
    component.productIdControl.markAsTouched();
    component.quantityControl.setValue(0);
    component.quantityControl.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('Product_Id must be a positive number');
    expect(shownMessages()).toContain('Quantity must be at least 1');

    component.productIdControl.setValue(mockItem.productId);
    component.quantityControl.setValue(mockItem.quantity);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('Product_Id must be a positive number');
    expect(shownMessages()).not.toContain('Quantity must be at least 1');
  });

  it('completes the whole update-order-item flow: look up, edit, submit, and show success', () => {
    orderServiceSpy.getItem.and.returnValue(of(new HttpResponse({ body: mockItem, status: 200 })));
    orderServiceSpy.updateItem.and.returnValue(of(new HttpResponse({ body: mockItem, status: 202 })));

    // Step 1 - enter the id and look the item up
    const idInput = debugElement.query(By.css('#itemId')).nativeElement as HTMLInputElement;
    idInput.value = String(mockItem.id);
    idInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(orderServiceSpy.getItem).toHaveBeenCalledWith(mockItem.id);

    // Step 2 - the form is populated; change the quantity and submit
    const newQuantity = MockOrderItems[2].quantity;
    const quantityInput = debugElement.query(By.css('#quantity')).nativeElement as HTMLInputElement;
    expect(quantityInput.value).toBe(String(mockItem.quantity));
    quantityInput.value = String(newQuantity);
    quantityInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const buttons = debugElement.queryAll(By.css('button[type="submit"]'));
    (buttons[buttons.length - 1].nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(orderServiceSpy.updateItem).toHaveBeenCalledWith(
      mockItem.id,
      jasmine.objectContaining({ id: mockItem.id, quantity: newQuantity })
    );
    expect(component.submitted).toBeTrue();
    const success = debugElement.query(By.css('h4')).nativeElement as HTMLElement;
    expect(success.textContent).toContain('Order Item updated successfully!');
  });
});
