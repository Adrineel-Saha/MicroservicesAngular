import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { ListProductsByNameComponent } from './list-products-by-name.component';
import { ProductService } from 'src/app/services/product.service';
import { MockProducts } from 'src/app/mockdata/product.mock';

describe('ListProductsByNameComponent', () => {
  let component: ListProductsByNameComponent;
  let fixture: ComponentFixture<ListProductsByNameComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getProductsByName']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ListProductsByNameComponent],
      providers: [{ provide: ProductService, useValue: productServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ListProductsByNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize an invalid empty form on init', () => {
    expect(component.submitted).toBeFalse();
    expect(component.isProductNameAbsent).toBeFalse();
    expect(component.productNameForm.valid).toBeFalse();
  });

  it('should require a product name', () => {
    expect(component.productNameControl.hasError('required')).toBeTrue();
    component.productNameControl.setValue('Mouse');
    expect(component.productNameControl.valid).toBeTrue();
  });

  it('should load products and set submitted=true on success', () => {
    productServiceSpy.getProductsByName.and.returnValue(of(new HttpResponse({ body: MockProducts, status: 200 })));

    component.productNameForm.setValue({ productName: 'Mouse' });
    component.onSubmit();

    expect(productServiceSpy.getProductsByName).toHaveBeenCalledWith('Mouse');
    expect(component.products).toEqual(MockProducts);
    expect(component.submitted).toBeTrue();
  });

  it('should default to an empty array when the response body is null', () => {
    productServiceSpy.getProductsByName.and.returnValue(of(new HttpResponse<any>({ body: null, status: 200 })));

    component.productNameForm.setValue({ productName: 'Mouse' });
    component.onSubmit();

    expect(component.products).toEqual([]);
  });

  it('should set isProductNameAbsent on a 404 then clear it after 2s', fakeAsync(() => {
    productServiceSpy.getProductsByName.and.returnValue(throwError(() => ({ status: 404 })));

    component.productNameForm.setValue({ productName: 'Ghost' });
    component.onSubmit();

    expect(component.isProductNameAbsent).toBeTrue();
    tick(2000);
    expect(component.isProductNameAbsent).toBeFalse();
  }));

  it('should not flag absence for non-404 errors', () => {
    productServiceSpy.getProductsByName.and.returnValue(throwError(() => ({ status: 500 })));

    component.productNameForm.setValue({ productName: 'Mouse' });
    component.onSubmit();

    expect(component.isProductNameAbsent).toBeFalse();
    expect(component.submitted).toBeFalse();
  });
});
