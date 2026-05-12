import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProductService } from './product.service';
import { MockProducts } from '../mockdata/product.mock';

describe('ProductService', () => {
  let productService: ProductService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:9191/api/products';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    productService = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(productService).toBeTruthy();
  });

  it('should return all products and return 200 status (getAllProducts)', () => {
    productService.getAllProducts().subscribe(response => {
      expect(response.body).toEqual(MockProducts);
      expect(response.body?.length).toBe(5);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('Ok');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(MockProducts, { status: 200, statusText: 'Ok' });
  });

  it('should handle 400 Bad Request (getAllProducts)', () => {
    productService.getAllProducts().subscribe({
      next: () => fail('should fail'),
      error: (error) => {
        expect(error.error).toBe('Product List is Empty');
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      }
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush('Product List is Empty', { status: 400, statusText: 'Bad Request' });
  });

  it('should return a single product and return 200 status (getProduct)', () => {
    const productId = 1;
    const mockProduct = MockProducts[0]; // first product

    productService.getProduct(productId).subscribe(response => {
      expect(response.body).toEqual(mockProduct);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('Ok');
    });

    const req = httpMock.expectOne(baseUrl + "/id/" + productId);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct, { status: 200, statusText: 'Ok' });
  });

  it('should handle 404 Not Found (getProduct)', () => {
    const productId = 999;

    productService.getProduct(productId).subscribe({
      next: () => fail('should fail for 404'),
      error: (error) => {
        expect(error.error).toBe('Product not found with Id: ' + productId);
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      }
    });

    const req = httpMock.expectOne(baseUrl + "/id/" + productId);
    expect(req.request.method).toBe('GET');
    req.flush('Product not found with Id: ' + productId, { status: 404, statusText: 'Not Found' });
  });

  it('should handle 400 Bad Request (getProduct)', () => {
    const productId = -1;

    productService.getProduct(productId).subscribe({
      next: () => fail('should fail for 400'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
        expect(error.error).toBe('Invalid product ID');
      }
    });

    const req = httpMock.expectOne(baseUrl + "/id/" + productId);
    expect(req.request.method).toBe('GET');
    req.flush('Invalid product ID', { status: 400, statusText: 'Bad Request' });
  });

  it('should create a product and return 201 status (createProduct)', () => {
    const newProduct = {
      name: 'New Product',
      description: 'This is a new product',
      price: 100,
      stock: 50
    };

    const createdProduct = {
      id: 6,
      name: 'New Product',
      description: 'This is a new product',
      price: 100,
      stock: 50
    };

    productService.createProduct(newProduct).subscribe(response => {
      expect(response.status).toBe(201);
      expect(response.statusText).toBe('Created');
      expect(response.body).toEqual(createdProduct);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProduct);
    req.flush(createdProduct, { status: 201, statusText: 'Created' });
  });

  it('should handle 400 Bad Request (createProduct)', () => {
    const invalidProduct = {
      name: '',
      description: 'invalid-description',
      price: -100,
      stock: -50
    };

    productService.createProduct(invalidProduct).subscribe({
      next: () => fail('should fail with 400 error'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
        expect(error.error).toBe('Product Name cannot be blank, Price should be positive, Stock cannot less then 0');
      }
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(invalidProduct);
    req.flush('Product Name cannot be blank, Price should be positive, Stock cannot less then 0', { status: 400, statusText: 'Bad Request' });
  });

  // Test for getProductsByName should return products matching the name and return 200 status
  it('should return products matching the name and return 200 status (getProductsByName)', () => {
    const productName = 'Noise-Cancelling Headphones';
    const matchingProducts = MockProducts.filter(p => p.name.includes(productName));

    productService.getProductsByName(productName).subscribe(response => {
      expect(response.body).toEqual(matchingProducts);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('Ok');
    });

    const req = httpMock.expectOne(baseUrl + "/name/" + productName);
    expect(req.request.method).toBe('GET');
    req.flush(matchingProducts, { status: 200, statusText: 'Ok' });
  });

  // Test for getProductsByName should return 404 Not Found when no products match the name
  it('should handle 404 Not Found (getProductsByName)', () => {
    const productName = 'NonExistingProduct';
    const errorMessage = 'Product not found with Name: ' + productName;

    productService.getProductsByName(productName).subscribe({
      next: () => fail('should fail with 404 error'),
      error: (error) => {
        expect(error.error).toBe(errorMessage);
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      }
    });

    const req = httpMock.expectOne(baseUrl + "/name/" + productName);
    expect(req.request.method).toBe('GET');
    req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
  });

  it('should update a product and return 202 status (updateProduct)', () => {
    const productId = 1;
    const updatedProduct = {
      name: 'Updated Product',
      description: 'This is an updated product',
      price: 150,
      stock: 75
    };

    productService.updateProduct(productId, updatedProduct).subscribe(response => {
      expect(response.status).toBe(202);
      expect(response.statusText).toBe('Accepted');
      expect(response.body).toEqual(updatedProduct);
    });

    const req = httpMock.expectOne(baseUrl + "/" + productId);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProduct);
    req.flush(updatedProduct, { status: 202, statusText: 'Accepted' });
  });

  it('should handle 400 Bad Request (updateProduct)', () => {
    const productId = -1;
    const invalidProduct = {
      name: '',
      description: 'invalid-description',
      price: -100,
      stock: -50
    };

    productService.updateProduct(productId, invalidProduct).subscribe({
      next: () => fail('should fail with 400 error'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
        expect(error.error).toBe('Product Name cannot be blank, Price should be positive, Stock cannot less then 0');
      }
    });

    const req = httpMock.expectOne(baseUrl + "/" + productId);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(invalidProduct);
    req.flush('Product Name cannot be blank, Price should be positive, Stock cannot less then 0', { status: 400, statusText: 'Bad Request' });
  });

  // updateProduct should return 404 Not Found when product does not exist
  it('should handle 404 Not Found (updateProduct)', () => {
    const productId = 999;
    const updatedProduct = {
      name: 'Updated Product',
      description: 'This is an updated product',
      price: 150,
      stock: 75
    };

    productService.updateProduct(productId, updatedProduct).subscribe({
      next: () => fail('should fail with 404 error'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error).toBe('Product not found with Id: ' + productId);
      }
    });

    const req = httpMock.expectOne(baseUrl + "/" + productId);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProduct);
    req.flush('Product not found with Id: ' + productId, { status: 404, statusText: 'Not Found' });
  });

  // deleteProduct should return 200 OK when product is successfully deleted
  it('should delete a product and return 200 status (deleteProduct)', () => {
    const productId = 1;
    const deleteMessage = 'Product deleted with Id: ' + productId;

    productService.deleteProduct(productId).subscribe(response => {
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('Ok');
      expect(response.body).toBe(deleteMessage);
    });

    const req = httpMock.expectOne(baseUrl + "/" + productId);
    expect(req.request.method).toBe('DELETE');
    req.flush(deleteMessage, { status: 200, statusText: 'Ok' });
  });

  // deleteProduct should return 404 Not Found when product does not exist
  it('should handle 404 Not Found (deleteProduct)', () => {
    const productId = 999;
    const errorMessage = 'Product not found with Id: ' + productId;

    productService.deleteProduct(productId).subscribe({
      next: () => fail('should fail with 404 error'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.error).toBe(errorMessage);
      }
    });

    const req = httpMock.expectOne(baseUrl + "/" + productId);
    expect(req.request.method).toBe('DELETE');
    req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
  });
});
