import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { CreateProductComponent } from './create-product.component';
import { ProductService } from 'src/app/services/product.service';
import { MockProducts } from 'src/app/mockdata/product.mock';

describe('CreateProductComponent', () => {
  let component: CreateProductComponent;
  let fixture: ComponentFixture<CreateProductComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const mockProduct = MockProducts[0];

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['createProduct']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CreateProductComponent],
      providers: [{ provide: ProductService, useValue: productServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProductComponent);
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
    expect(component.productForm).toBeDefined();
    expect(component.productForm.valid).toBeFalse();
  });

  it('should reject a price below 1', () => {
    component.priceControl.setValue(0);
    expect(component.priceControl.hasError('min')).toBeTrue();
  });

  it('should reject a negative stock', () => {
    component.stockControl.setValue(-1);
    expect(component.stockControl.hasError('min')).toBeTrue();
  });

  it('should allow a stock of 0', () => {
    component.stockControl.setValue(0);
    expect(component.stockControl.valid).toBeTrue();
  });

  it('should be valid with proper values', () => {
    component.productForm.patchValue(mockProduct);
    expect(component.productForm.valid).toBeTrue();
  });

  it('should call createProduct and set submitted=true on success', () => {
    productServiceSpy.createProduct.and.returnValue(of(new HttpResponse({ body: mockProduct, status: 201 })));

    component.productForm.patchValue(mockProduct);
    component.onSubmit();

    expect(productServiceSpy.createProduct).toHaveBeenCalled();
    expect(component.submitted).toBeTrue();
  });

  it('should not set submitted=true when the service errors', () => {
    productServiceSpy.createProduct.and.returnValue(throwError(() => ({ status: 400 })));

    component.productForm.patchValue(mockProduct);
    component.onSubmit();

    expect(component.submitted).toBeFalse();
  });

  it('should render the heading via debugElement', () => {
    const heading = debugElement.query(By.css('h3'));
    expect((heading.nativeElement as HTMLElement).textContent).toContain('Add a New Product');
  });

  it('should render the four product inputs', () => {
    const inputs = debugElement.queryAll(By.css('input'));
    expect(inputs.length).toBe(4);
    expect(debugElement.query(By.css('#name'))).toBeTruthy();
    expect(nativeElement.querySelector('#price')).toBeTruthy();
  });

  it('should keep the submit button disabled until the form is valid', () => {
    const button = debugElement.query(By.css('button[type="submit"]'));
    const buttonElement = button.nativeElement as HTMLButtonElement;
    expect(buttonElement.textContent?.trim()).toBe('Submit');
    expect(buttonElement.disabled).toBeTrue();

    component.productForm.patchValue(mockProduct);
    fixture.detectChanges();
    expect(buttonElement.disabled).toBeFalse();
  });

  const shownMessages = (): string[] =>
    debugElement.queryAll(By.css('p')).map(p => ((p.nativeElement as HTMLElement).textContent ?? '').trim());

  it('should render the min message for a non-positive price and clear it when valid', () => {
    component.priceControl.setValue(0);
    component.priceControl.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('Price should be positive');

    component.priceControl.setValue(mockProduct.price);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('Price should be positive');
  });

  it('should render the min message for a negative stock and clear it when valid', () => {
    component.stockControl.setValue(-1);
    component.stockControl.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('Stock cannot less then 0');

    component.stockControl.setValue(mockProduct.stock);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('Stock cannot less then 0');
  });

  it('should render the required message when the product name is blank and clear it when filled', () => {
    component.productNameControl.setValue('');
    component.productNameControl.markAsTouched();
    fixture.detectChanges();
    expect(shownMessages()).toContain('Product_Name cannot be blank');

    component.productNameControl.setValue(mockProduct.name);
    fixture.detectChanges();
    expect(shownMessages()).not.toContain('Product_Name cannot be blank');
  });

  it('completes the whole create-product flow: fill the form, submit, and show success', () => {
    productServiceSpy.createProduct.and.returnValue(of(new HttpResponse({ body: mockProduct, status: 201 })));

    const nameInput = debugElement.query(By.css('#name')).nativeElement as HTMLInputElement;
    const descriptionInput = debugElement.query(By.css('#description')).nativeElement as HTMLInputElement;
    const priceInput = debugElement.query(By.css('#price')).nativeElement as HTMLInputElement;
    const stockInput = debugElement.query(By.css('#stock')).nativeElement as HTMLInputElement;
    nameInput.value = mockProduct.name;
    nameInput.dispatchEvent(new Event('input'));
    descriptionInput.value = mockProduct.description;
    descriptionInput.dispatchEvent(new Event('input'));
    priceInput.value = String(mockProduct.price);
    priceInput.dispatchEvent(new Event('input'));
    stockInput.value = String(mockProduct.stock);
    stockInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submit = debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
    expect(submit.disabled).toBeFalse();
    submit.click();
    fixture.detectChanges();

    expect(productServiceSpy.createProduct).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: mockProduct.name, price: mockProduct.price, stock: mockProduct.stock })
    );
    expect(component.submitted).toBeTrue();
    const success = debugElement.query(By.css('h4')).nativeElement as HTMLElement;
    expect(success.textContent).toContain('Product Added Successfully!');
    expect((success.parentElement as HTMLElement).hidden).toBeFalse();
  });
});
