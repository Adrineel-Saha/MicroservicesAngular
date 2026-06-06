import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UpdateProductComponent } from './update-product.component';
import { ProductService } from 'src/app/services/product.service';
import { MockProducts } from 'src/app/mockdata/product.mock';

describe('UpdateProductComponent', () => {
  let component: UpdateProductComponent;
  let fixture: ComponentFixture<UpdateProductComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const mockProduct = MockProducts[0];

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getProduct', 'updateProduct']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [UpdateProductComponent],
      providers: [{ provide: ProductService, useValue: productServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateProductComponent);
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
    expect(component.isProductIdAbsent).toBeFalse();
    expect(component.productIdForm.valid).toBeFalse();
    expect(component.updateProductForm.valid).toBeFalse();
  });

  it('onUpdate should fetch the product and patch the update form', () => {
    productServiceSpy.getProduct.and.returnValue(of(new HttpResponse({ body: mockProduct, status: 200 })));

    component.productIdForm.setValue({ productId: mockProduct.id });
    component.onUpdate();

    expect(productServiceSpy.getProduct).toHaveBeenCalledWith(mockProduct.id);
    expect(component.productId).toBe(mockProduct.id);
    expect(component.showFormInitial).toBeTrue();
    expect(component.updateProductForm.get('name')?.value).toBe(mockProduct.name);
  });

  it('onUpdate should flag a missing product on 404 and clear it after 2s', fakeAsync(() => {
    productServiceSpy.getProduct.and.returnValue(throwError(() => ({ status: 404 })));

    component.productIdForm.setValue({ productId: 99 });
    component.onUpdate();

    expect(component.isProductIdAbsent).toBeTrue();
    tick(2000);
    expect(component.isProductIdAbsent).toBeFalse();
  }));

  it('onSubmit should update the product and set the success flags', () => {
    productServiceSpy.updateProduct.and.returnValue(of(new HttpResponse({ body: mockProduct, status: 202 })));

    component.productId = mockProduct.id;
    component.updateProductForm.setValue(mockProduct);
    component.onSubmit();

    expect(productServiceSpy.updateProduct).toHaveBeenCalledWith(mockProduct.id, mockProduct as any);
    expect(component.showForm).toBeTrue();
    expect(component.submitted).toBeTrue();
  });

  it('onSubmit should not set success flags when the service errors', () => {
    productServiceSpy.updateProduct.and.returnValue(throwError(() => ({ status: 500 })));

    component.productId = mockProduct.id;
    component.updateProductForm.setValue(mockProduct);
    component.onSubmit();

    expect(component.showForm).toBeFalse();
    expect(component.submitted).toBeFalse();
  });
});
