import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { ListOrdersByUserComponent } from './list-orders-by-user.component';
import { OrderService } from 'src/app/services/order.service';
import { MockOrders } from 'src/app/mockdata/order.mock';

describe('ListOrdersByUserComponent', () => {
  let component: ListOrdersByUserComponent;
  let fixture: ComponentFixture<ListOrdersByUserComponent>;
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
    component.userIdControl.setValue(1);
    expect(component.userIdControl.valid).toBeTrue();
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
});
