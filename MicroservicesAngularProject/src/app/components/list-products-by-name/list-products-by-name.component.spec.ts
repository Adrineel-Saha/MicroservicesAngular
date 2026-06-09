import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { ListProductsByNameComponent } from './list-products-by-name.component';
import { ProductService } from 'src/app/services/product.service';
import { MockProducts } from 'src/app/mockdata/product.mock';

describe('ListProductsByNameComponent', () => {
  let component: ListProductsByNameComponent;
  let fixture: ComponentFixture<ListProductsByNameComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
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
    debugElement = fixture.debugElement;
    nativeElement = debugElement.nativeElement as HTMLElement;
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

  it('should render the heading via debugElement', () => {
    const heading = debugElement.query(By.css('h3'));
    expect((heading.nativeElement as HTMLElement).textContent).toContain('List Products by Name');
  });

  it('should render a single productName input and keep submit disabled until valid', () => {
    const input = debugElement.query(By.css('#productName'));
    expect(input).toBeTruthy();
    expect(nativeElement.querySelector('#productName')).toBe(input.nativeElement);

    const button = debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(button.disabled).toBeTrue();

    component.productNameForm.setValue({ productName: 'Mouse' });
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();
  });

  it('should render a table row per product after a successful search', () => {
    productServiceSpy.getProductsByName.and.returnValue(of(new HttpResponse({ body: MockProducts, status: 200 })));

    component.productNameForm.setValue({ productName: 'Mouse' });
    component.onSubmit();
    fixture.detectChanges();

    const rows = debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(MockProducts.length);
    expect((rows[0].nativeElement as HTMLElement).textContent).toContain(MockProducts[0].name);
  });
});
