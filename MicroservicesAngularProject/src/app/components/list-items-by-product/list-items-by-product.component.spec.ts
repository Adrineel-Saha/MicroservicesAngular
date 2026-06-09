import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { ListItemsByProductComponent } from './list-items-by-product.component';
import { OrderService } from 'src/app/services/order.service';
import { MockOrderItems } from 'src/app/mockdata/order-item.mock';

describe('ListItemsByProductComponent', () => {
  let component: ListItemsByProductComponent;
  let fixture: ComponentFixture<ListItemsByProductComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;

  beforeEach(async () => {
    orderServiceSpy = jasmine.createSpyObj('OrderService', ['listItemsByProduct']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ListItemsByProductComponent],
      providers: [{ provide: OrderService, useValue: orderServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ListItemsByProductComponent);
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
    expect(component.isProductIdAbsent).toBeFalse();
    expect(component.productIdForm.valid).toBeFalse();
  });

  it('should reject a productId below 1', () => {
    component.productIdControl.setValue(0);
    expect(component.productIdControl.hasError('min')).toBeTrue();
    component.productIdControl.setValue(1);
    expect(component.productIdControl.valid).toBeTrue();
  });

  it('should load items and set submitted=true on success', () => {
    orderServiceSpy.listItemsByProduct.and.returnValue(of(new HttpResponse({ body: MockOrderItems, status: 200 })));

    component.productIdForm.setValue({ productId: 1 });
    component.onSubmit();

    expect(orderServiceSpy.listItemsByProduct).toHaveBeenCalledWith(1);
    expect(component.orderItems).toEqual(MockOrderItems);
    expect(component.submitted).toBeTrue();
  });

  it('should default to an empty array when the response body is null', () => {
    orderServiceSpy.listItemsByProduct.and.returnValue(of(new HttpResponse<any>({ body: null, status: 200 })));

    component.productIdForm.setValue({ productId: 1 });
    component.onSubmit();

    expect(component.orderItems).toEqual([]);
  });

  it('should set isProductIdAbsent on a 400 then clear it after 2s', fakeAsync(() => {
    orderServiceSpy.listItemsByProduct.and.returnValue(throwError(() => ({ status: 400 })));

    component.productIdForm.setValue({ productId: 99 });
    component.onSubmit();

    expect(component.isProductIdAbsent).toBeTrue();
    tick(2000);
    expect(component.isProductIdAbsent).toBeFalse();
  }));

  it('should not flag absence for non-400 errors', () => {
    orderServiceSpy.listItemsByProduct.and.returnValue(throwError(() => ({ status: 500 })));

    component.productIdForm.setValue({ productId: 1 });
    component.onSubmit();

    expect(component.isProductIdAbsent).toBeFalse();
    expect(component.submitted).toBeFalse();
  });

  it('should render the heading via debugElement', () => {
    const heading = debugElement.query(By.css('h3'));
    expect((heading.nativeElement as HTMLElement).textContent).toContain('List Items By Products');
  });

  it('should render a single productId input and keep submit disabled until valid', () => {
    const input = debugElement.query(By.css('#productId'));
    expect(input).toBeTruthy();
    expect(nativeElement.querySelector('#productId')).toBe(input.nativeElement);

    const button = debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(button.disabled).toBeTrue();

    component.productIdForm.setValue({ productId: 1 });
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();
  });

  it('should render a table row per item after a successful search', () => {
    orderServiceSpy.listItemsByProduct.and.returnValue(of(new HttpResponse({ body: MockOrderItems, status: 200 })));

    component.productIdForm.setValue({ productId: 1 });
    component.onSubmit();
    fixture.detectChanges();

    const rows = debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(MockOrderItems.length);
    expect((rows[0].nativeElement as HTMLElement).textContent).toContain(MockOrderItems[0].name);
  });
});
