import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UpdateProductComponent } from './update-product.component';
import { ProductService } from 'src/app/services/product.service';
import { MockProducts } from 'src/app/mockdata/product.mock';

describe('UpdateProductComponent', () => {
  let component: UpdateProductComponent;
  let fixture: ComponentFixture<UpdateProductComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
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

  it('should render the heading via debugElement', () => {
    const heading = debugElement.query(By.css('h3'));
    expect((heading.nativeElement as HTMLElement).textContent).toContain('Update an existing Product');
  });

  it('should render the lookup input and keep the Update Product button disabled until valid', () => {
    const input = debugElement.query(By.css('#productId'));
    expect(input).toBeTruthy();
    expect(nativeElement.querySelector('#productId')).toBe(input.nativeElement);

    const button = debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(button.textContent?.trim()).toBe('Update Product');
    expect(button.disabled).toBeTrue();

    component.productIdForm.setValue({ productId: mockProduct.id });
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();
  });

  it('should populate the edit form inputs after a successful lookup', () => {
    productServiceSpy.getProduct.and.returnValue(of(new HttpResponse({ body: mockProduct, status: 200 })));

    component.productIdForm.setValue({ productId: mockProduct.id });
    component.onUpdate();
    fixture.detectChanges();

    const nameInput = debugElement.query(By.css('#name')).nativeElement as HTMLInputElement;
    expect(nameInput.value).toBe(mockProduct.name);
  });

  const shownMessages = (): string[] =>
    debugElement.queryAll(By.css('p')).map(p => ((p.nativeElement as HTMLElement).textContent ?? '').trim());

  it('should render the min message for a non-positive lookup productId and clear it when valid', () => {
    component.productIdControlOne.setValue(0);
    component.productIdControlOne.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('Product_Id should be positive');

    component.productIdControlOne.setValue(mockProduct.id);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('Product_Id should be positive');
  });

  it('should render edit-form validation messages for invalid input after a lookup', () => {
    productServiceSpy.getProduct.and.returnValue(of(new HttpResponse({ body: mockProduct, status: 200 })));
    component.productIdForm.setValue({ productId: mockProduct.id });
    component.onUpdate();
    fixture.detectChanges();

    component.productNameControl.setValue('');
    component.productNameControl.markAsTouched();
    component.priceControl.setValue(0);
    component.priceControl.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('Product_Name cannot be blank');
    expect(shownMessages()).toContain('Price should be positive');

    component.productNameControl.setValue(mockProduct.name);
    component.priceControl.setValue(mockProduct.price);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('Product_Name cannot be blank');
    expect(shownMessages()).not.toContain('Price should be positive');
  });

  it('completes the whole update-product flow: look up, edit, submit, and show success', () => {
    productServiceSpy.getProduct.and.returnValue(of(new HttpResponse({ body: mockProduct, status: 200 })));
    productServiceSpy.updateProduct.and.returnValue(of(new HttpResponse({ body: mockProduct, status: 202 })));

    // Step 1 - enter the id and look the product up
    const idInput = debugElement.query(By.css('#productId')).nativeElement as HTMLInputElement;
    idInput.value = String(mockProduct.id);
    idInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(productServiceSpy.getProduct).toHaveBeenCalledWith(mockProduct.id);

    // Step 2 - the edit form is populated; change the name and submit
    const newName = MockProducts[1].name;
    const nameInput = debugElement.query(By.css('#name')).nativeElement as HTMLInputElement;
    expect(nameInput.value).toBe(mockProduct.name);
    nameInput.value = newName;
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const buttons = debugElement.queryAll(By.css('button[type="submit"]'));
    (buttons[buttons.length - 1].nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(productServiceSpy.updateProduct).toHaveBeenCalledWith(
      mockProduct.id,
      jasmine.objectContaining({ id: mockProduct.id, name: newName })
    );
    expect(component.submitted).toBeTrue();
    const success = debugElement.query(By.css('h4')).nativeElement as HTMLElement;
    expect(success.textContent).toContain('Product updated successfully!');
  });
});
