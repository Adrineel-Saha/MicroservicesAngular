import { TestBed } from '@angular/core/testing';

import { OrderService } from './order.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockOrders } from '../mockdata/order.mock';
import { MockOrderItems } from '../mockdata/order-item.mock';

describe('OrderService', () => {
  let orderService: OrderService;
  let httpMock: HttpTestingController;

  const baseUrlOrder = 'http://localhost:9191/api/orders';
  const baseUrlOrderItem = 'http://localhost:9191/api/orders/items';
  
  beforeEach(() => {
    TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [OrderService]
          });
    
    orderService = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(orderService).toBeTruthy();
  });

  it('should attach a Bearer Authorization header on order requests when a token is present', () => {
    sessionStorage.setItem('auth_token', 'test-jwt');

    orderService.listOrders().subscribe();

    const req = httpMock.expectOne(baseUrlOrder);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt');
    req.flush(MockOrders);
  });

  it('should attach a Bearer Authorization header on order-item requests when a token is present', () => {
    sessionStorage.setItem('auth_token', 'test-jwt');

    orderService.listItems().subscribe();

    const req = httpMock.expectOne(baseUrlOrderItem);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt');
    req.flush(MockOrderItems);
  });

  it('should not attach an Authorization header when no token is present', () => {
    orderService.listOrders().subscribe();

    const req = httpMock.expectOne(baseUrlOrder);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush(MockOrders);
  });

  it('should return all Orders and return 200 status (listOrders)', () => {
      orderService.listOrders().subscribe(response => {
        expect(response.body).toEqual(MockOrders);
        expect(response.body?.length).toBe(5);
        expect(response.status).toBe(200);
        expect(response.statusText).toBe('Ok');
      });
  
      const req = httpMock.expectOne(baseUrlOrder);
      expect(req.request.method).toBe('GET');
      req.flush(MockOrders, { status: 200, statusText: 'Ok' });
    });
  
    it('should handle 400 Bad Request (listOrders)', () => {
      orderService.listOrders().subscribe({
        next: () => fail('should fail'),
        error: (error) => {
          expect(error.error).toBe('Order List is Empty');
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });
  
      const req = httpMock.expectOne(baseUrlOrder);
      expect(req.request.method).toBe('GET');
      req.flush('Order List is Empty', { status: 400, statusText: 'Bad Request' });
    });

    it('should return a single order and return 200 status (getOrder)', () => {
        const orderId= 1;
        const mockOrder = MockOrders[0]; // first order
    
        orderService.getOrder(orderId).subscribe(response => {
          expect(response.body).toEqual(mockOrder);
          expect(response.status).toBe(200);
          expect(response.statusText).toBe('Ok');
        });
    
        const req = httpMock.expectOne(baseUrlOrder + "/" + orderId);
        expect(req.request.method).toBe('GET');
        req.flush(mockOrder, { status: 200, statusText: 'Ok' });
      });
    
      it('should handle 404 Not Found (getOrder)', () => {
        const orderId = 999;
    
        orderService.getOrder(orderId).subscribe({
          next: () => fail('should fail for 404'),
          error: (error) => {
            expect(error.error).toBe('Order not found with Id: ' + orderId);
            expect(error.status).toBe(404);
            expect(error.statusText).toBe('Not Found');
          }
        });
    
        const req = httpMock.expectOne(baseUrlOrder + "/" + orderId);
        expect(req.request.method).toBe('GET');
        req.flush('Order not found with Id: ' + orderId, { status: 404, statusText: 'Not Found' });
      });
    
      it('should handle 400 Bad Request (getOrder)', () => {
        const orderId = -1;
    
        orderService.getOrder(orderId).subscribe({
          next: () => fail('should fail for 400'),
          error: (error) => {
            expect(error.status).toBe(400);
            expect(error.statusText).toBe('Bad Request');
            expect(error.error).toBe('Invalid order ID');
          }
        });
    
        const req = httpMock.expectOne(baseUrlOrder + "/" + orderId);
        expect(req.request.method).toBe('GET');
        req.flush('Invalid order ID', { status: 400, statusText: 'Bad Request' });
      });

      it('should create an order and return 201 status (createOrder)', () => {
        const newOrder = {
          userId: MockOrders[0].userId,
          status: MockOrders[0].status
        };

        const createdOrder = { ...MockOrders[0], id: MockOrders.length + 1 };
      
        orderService.createOrder(newOrder).subscribe(response => {
          expect(response.status).toBe(201);
          expect(response.statusText).toBe('Created');
          expect(response.body).toEqual(createdOrder);
        });
      
        const req = httpMock.expectOne(baseUrlOrder);
      
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newOrder);
      
        req.flush(createdOrder, { status: 201, statusText: 'Created' });
      });

      it('should handle 400 Bad Request (createOrder)', () => {

        const invalidOrder = {
          userId: 0,   // invalid
          status: ''
        };
      
        orderService.createOrder(invalidOrder).subscribe({
          next: () => fail('should fail with 400 error'),
          error: (error) => {
            expect(error.status).toBe(400);
            expect(error.statusText).toBe('Bad Request');
            expect(error.error).toBe('User_Id must be a positive number, Status must be one of: CREATED, PAID, SHIPPED, CANCELLED');
          }
        });
      
        const req = httpMock.expectOne(baseUrlOrder);
      
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(invalidOrder);
      
        req.flush('User_Id must be a positive number, Status must be one of: CREATED, PAID, SHIPPED, CANCELLED', 
          {
          status: 400,
          statusText: 'Bad Request'
          });
      });

      it('should return orders for a given user and return 200 status (listOrdersByUser)', () => {
        const userId = 1;
        const userOrders = MockOrders.filter(o => o.userId === userId);
      
        orderService.listOrdersByUser(userId).subscribe(response => {
          expect(response.body).toEqual(userOrders);
          expect(response.status).toBe(200);
          expect(response.statusText).toBe('Ok');
      
        });
      
        const req = httpMock.expectOne(baseUrlOrder + "/user/" + userId);
        expect(req.request.method).toBe('GET');
        req.flush(userOrders, { status: 200, statusText: 'Ok'});
      });

      it('should handle 404 Not Found (listOrdersByUser)', () => {
        const userId = 999;
      
        const errorMessage = 'Orders not found for userId: ' + userId;
      
        orderService.listOrdersByUser(userId).subscribe({
          next: () => fail('should fail with 404 error'),
          error: (error) => {
            expect(error.error).toBe(errorMessage);
            expect(error.status).toBe(404);
            expect(error.statusText).toBe('Not Found');
      
          }
        });
      
        const req = httpMock.expectOne(baseUrlOrder + "/user/" + userId);
        expect(req.request.method).toBe('GET');
        req.flush(errorMessage, { status: 404, statusText: 'Not Found'});
      });

      it('should update order status and return 202 status (updateOrderStatus)', () => {
        const newStatus = MockOrders[3].status; // a different valid status: SHIPPED
        const updatedOrder = { ...MockOrders[0], status: newStatus };
        const orderId = updatedOrder.id;
        const status = updatedOrder.status;
      
        orderService.updateOrderStatus(orderId, status).subscribe(response => {
          expect(response.body).toEqual(updatedOrder);
          expect(response.status).toBe(202);
          expect(response.statusText).toBe('Accepted');
        });
      
        const req = httpMock.expectOne(baseUrlOrder+"/"+orderId+"/status/"+status);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toBeNull(); // ✅ important (body is null)
      
        req.flush(updatedOrder, { status: 202, statusText: 'Accepted' });
      });
      
      it('should handle 400 Bad Request (updateOrderStatus)', () => {
        const orderId = 1;
        const status = ''; // invalid status
      
        const errorMessage = 'Status must be one of: CREATED, PAID, SHIPPED, CANCELLED';
      
        orderService.updateOrderStatus(orderId, status).subscribe({
          next: () => fail('should fail with 400 error'),
          error: (error) => {
            expect(error.error).toBe(errorMessage);
            expect(error.status).toBe(400);
            expect(error.statusText).toBe('Bad Request');
          }
        });
      
        const req = httpMock.expectOne(baseUrlOrder+"/"+orderId+"/status/"+status);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toBeNull();
        req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
      });
      
      it('should handle 404 Not Found (updateOrderStatus)', () => {
        const orderId = 999; // non-existing
        const status = 'SHIPPED';
      
        const errorMessage = 'Order not found with Id: ' + orderId;
      
        orderService.updateOrderStatus(orderId, status).subscribe({
          next: () => fail('should fail with 404 error'),
          error: (error) => {
            expect(error.error).toBe(errorMessage);
            expect(error.status).toBe(404);
            expect(error.statusText).toBe('Not Found');
          }
        });
      
        const req = httpMock.expectOne(baseUrlOrder+"/"+orderId+"/status/"+status);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toBeNull();
        req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
      });

      // deleteOrder should return 200 OK when order is successfully deleted
      it('should delete an order and return 200 status (deleteOrder)', () => {
        const orderId = 1;
        const deleteMessage = 'Order deleted with Id: ' + orderId;

        orderService.deleteOrder(orderId).subscribe(response => {
          expect(response.body).toBe(deleteMessage);
          expect(response.status).toBe(200);
          expect(response.statusText).toBe('Ok');
        });

        const req = httpMock.expectOne(baseUrlOrder+"/"+orderId);
        expect(req.request.method).toBe('DELETE');
        req.flush(deleteMessage, { status: 200, statusText: 'Ok' });
      });

      // deleteOrder should return 404 Not Found when order does not exist
      it('should handle 404 Not Found (deleteOrder)', () => {
        const orderId = 999;
        const errorMessage = 'Order not found with Id: ' + orderId;

        orderService.deleteOrder(orderId).subscribe({
          next: () => fail('should fail with 404 error'),
          error: (error) => {
            expect(error.error).toBe(errorMessage);
            expect(error.status).toBe(404);
            expect(error.statusText).toBe('Not Found');
          }
        });

        const req = httpMock.expectOne(baseUrlOrder+"/"+orderId);
        expect(req.request.method).toBe('DELETE');
        req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
      });

      it('should return all Order Items and return 200 status (listItems)', () => {
        orderService.listItems().subscribe(response => {
          expect(response.body).toEqual(MockOrderItems);
          expect(response.body?.length).toBe(5);
          expect(response.status).toBe(200);
          expect(response.statusText).toBe('Ok');
        });
    
        const req = httpMock.expectOne(baseUrlOrderItem);
        expect(req.request.method).toBe('GET');
        req.flush(MockOrderItems, { status: 200, statusText: 'Ok' });
      });
    
      it('should handle 400 Bad Request (listItems)', () => {
        orderService.listItems().subscribe({
          next: () => fail('should fail'),
          error: (error) => {
            expect(error.error).toBe('Item List is Empty');
            expect(error.status).toBe(400);
            expect(error.statusText).toBe('Bad Request');
          }
        });
    
        const req = httpMock.expectOne(baseUrlOrderItem);
        expect(req.request.method).toBe('GET');
        req.flush('Item List is Empty', { status: 400, statusText: 'Bad Request' });
      });

      it('should return a single order and return 200 status (getItem)', () => {
        const itemId= 1;
        const mockItem = MockOrderItems[0]; // first order item
    
        orderService.getItem(itemId).subscribe(response => {
          expect(response.body).toEqual(mockItem);
          expect(response.status).toBe(200);
          expect(response.statusText).toBe('Ok');
        });
    
        const req = httpMock.expectOne(baseUrlOrderItem + "/" + itemId);
        expect(req.request.method).toBe('GET');
        req.flush(mockItem, { status: 200, statusText: 'Ok' });
      });
    
      it('should handle 404 Not Found (getItem)', () => {
        const itemId = 999;
    
        orderService.getItem(itemId).subscribe({
          next: () => fail('should fail for 404'),
          error: (error) => {
            expect(error.error).toBe('Item not found with Id: ' + itemId);
            expect(error.status).toBe(404);
            expect(error.statusText).toBe('Not Found');
          }
        });
    
        const req = httpMock.expectOne(baseUrlOrderItem + "/" + itemId);
        expect(req.request.method).toBe('GET');
        req.flush('Item not found with Id: ' + itemId, { status: 404, statusText: 'Not Found' });
      });
    
      it('should handle 400 Bad Request (getItem)', () => {
        const itemId = -1;
    
        orderService.getItem(itemId).subscribe({
          next: () => fail('should fail for 400'),
          error: (error) => {
            expect(error.status).toBe(400);
            expect(error.statusText).toBe('Bad Request');
            expect(error.error).toBe('Invalid item ID');
          }
        });
    
        const req = httpMock.expectOne(baseUrlOrderItem + "/" + itemId);
        expect(req.request.method).toBe('GET');
        req.flush('Invalid item ID', { status: 400, statusText: 'Bad Request' });
      });
  
      it('should create an order item and return 201 status (addItem)', () => {
        const newItem = {
          productId: MockOrderItems[0].productId,
          quantity: MockOrderItems[0].quantity,
          orderId: MockOrderItems[0].orderId
        };

        const createdItem = {
          ...newItem,
          id: MockOrderItems.length + 1,
          price: MockOrderItems[0].price,
          name: 'New ' + MockOrderItems[0].name,
          description: 'New ' + MockOrderItems[0].description,
          stock: MockOrderItems[0].stock
        };
      
        orderService.addItem(newItem).subscribe(response => {
          expect(response.body).toEqual(createdItem);
          expect(response.status).toBe(201);
          expect(response.statusText).toBe('Created');
        });
      
        const req = httpMock.expectOne(baseUrlOrderItem);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newItem);
      
        req.flush(createdItem, { status: 201, statusText: 'Created' });
      });

      it('should handle 400 Bad Request (addItem)', () => {
        const invalidItem = {
          productId: 0,   // invalid
          quantity: 0,    // invalid
          orderId: 10      // invalid
        };
      
        orderService.addItem(invalidItem).subscribe({
          next: () => fail('should fail with 400 error'),
          error: (error) => {
            expect(error.error).toBe('Product_Id must be a positive number, Quantity must be at least 1');
            expect(error.status).toBe(400);
            expect(error.statusText).toBe('Bad Request');
          }
        });
      
        const req = httpMock.expectOne(baseUrlOrderItem);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(invalidItem);
      
        req.flush('Product_Id must be a positive number, Quantity must be at least 1', {
          status: 400,
          statusText: 'Bad Request'
        });
      });

      it('should return items for a given product and return 200 status (listItemsByProduct)', () => {
        const productId = 1;
        const productItems = MockOrderItems.filter(i => i.productId === productId);
      
        orderService.listItemsByProduct(productId).subscribe(response => {
          expect(response.body).toEqual(productItems);
          expect(response.status).toBe(200);
          expect(response.statusText).toBe('Ok');
        });
      
        const req = httpMock.expectOne(baseUrlOrderItem + "/product/" + productId);
        expect(req.request.method).toBe('GET');
        req.flush(productItems, { status: 200, statusText: 'Ok' });
      });

      it('should handle 404 Not Found (listItemsByProduct)', () => {
        const productId = 999;
        const errorMessage = 'Item List is Empty';
      
        orderService.listItemsByProduct(productId).subscribe({
          next: () => fail('should fail with 404 error'),
          error: (error) => {
            expect(error.error).toBe(errorMessage);
            expect(error.status).toBe(404);
            expect(error.statusText).toBe('Not Found');
          }
        });
      
        const req = httpMock.expectOne(baseUrlOrderItem + "/product/" + productId);
        expect(req.request.method).toBe('GET');
        req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
      });

      it('should return items for a given order and return 200 status (listItemsByOrder)', () => {
        const orderId = 1;
      
        const orderItems = MockOrderItems.filter(i => i.orderId === orderId);
      
        orderService.listItemsByOrder(orderId).subscribe(response => {
          expect(response.body).toEqual(orderItems);
          expect(response.status).toBe(200);
          expect(response.statusText).toBe('Ok');
        });
      
        const req = httpMock.expectOne(baseUrlOrderItem + "/order/" + orderId);
        expect(req.request.method).toBe('GET');
        req.flush(orderItems, { status: 200, statusText: 'Ok' });
      });

      it('should handle 404 Not Found (listItemsByOrder)', () => {
        const orderId = 999;
        const errorMessage = 'Item List is Empty';
      
        orderService.listItemsByOrder(orderId).subscribe({
          next: () => fail('should fail with 404 error'),
          error: (error) => {
            expect(error.error).toBe(errorMessage);
            expect(error.status).toBe(404);
            expect(error.statusText).toBe('Not Found');
          }
        });
      
        const req = httpMock.expectOne(baseUrlOrderItem + "/order/" + orderId);
        expect(req.request.method).toBe('GET');
        req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
      });

      it('should update an order item and return 202 status (updateItem)', () => {
        const updatedItem = {
          ...MockOrderItems[0],
          quantity: MockOrderItems[0].quantity + 1,
          name: 'Updated ' + MockOrderItems[0].name
        };
        const itemId = updatedItem.id;
      
        orderService.updateItem(itemId, updatedItem).subscribe(response => {
          expect(response.body).toEqual(updatedItem);
          expect(response.status).toBe(202);
          expect(response.statusText).toBe('Accepted');
        });
      
        const req = httpMock.expectOne(baseUrlOrderItem + "/" + itemId);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updatedItem);
        req.flush(updatedItem, { status: 202, statusText: 'Accepted' });
      });

      it('should handle 400 Bad Request (updateItem)', () => {
        const itemId = 2;
        const invalidItem = {
          productId: 0,
          quantity: 0,
          orderId: 0,
          name: 'Updated Item',
          description: 'Updated description',
          stock: 10
        };
      
        orderService.updateItem(itemId, invalidItem).subscribe({
          next: () => fail('should fail with 400 error'),
          error: (error) => {
            expect(error.status).toBe(400);
            expect(error.statusText).toBe('Bad Request');
            expect(error.error).toBe(
              'ProductId must be positive, Quantity must be greater than 0, OrderId must be positive'
            );
          }
        });
      
        const req = httpMock.expectOne(baseUrlOrderItem + "/" + itemId);
      
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(invalidItem);
      
        req.flush(
          'ProductId must be positive, Quantity must be greater than 0, OrderId must be positive',
          { status: 400, statusText: 'Bad Request' }
        );
      });

      it('should handle 404 Not Found (updateItem)', () => {
        const itemId = 999;

        const updatedItem = {
          ...MockOrderItems[0],
          quantity: MockOrderItems[0].quantity + 1,
          name: 'Updated ' + MockOrderItems[0].name
        };
      
        const errorMessage = 'OrderItem not found with Id: ' + itemId;
      
        orderService.updateItem(itemId, updatedItem).subscribe({
          next: () => fail('should fail with 404 error'),
          error: (error) => {
            expect(error.error).toBe(errorMessage);
            expect(error.status).toBe(404);
            expect(error.statusText).toBe('Not Found');
          }
        });
      
        const req = httpMock.expectOne(baseUrlOrderItem + "/" + itemId);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updatedItem);
        req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
      });

      // deleteItem should return 200 OK when item is successfully deleted
      it('should delete an order item and return 200 status (deleteItem)', () => {
        const itemId = 1;
        const deleteMessage = 'OrderItem deleted with Id: ' + itemId;

        orderService.deleteItem(itemId).subscribe(response => {
          expect(response.body).toBe(deleteMessage);
          expect(response.status).toBe(200);
          expect(response.statusText).toBe('Ok');
        });

        const req = httpMock.expectOne(baseUrlOrderItem + "/" + itemId);
        expect(req.request.method).toBe('DELETE');
        req.flush(deleteMessage, { status: 200, statusText: 'Ok' });
      });

      // deleteItem should return 404 Not Found when item does not exist
      it('should handle 404 Not Found (deleteItem)', () => {
        const itemId = 999;
        const errorMessage = 'OrderItem not found with Id: ' + itemId;

        orderService.deleteItem(itemId).subscribe({
          next: () => fail('should fail with 404 error'),
          error: (error) => {
            expect(error.error).toBe(errorMessage);
            expect(error.status).toBe(404);
            expect(error.statusText).toBe('Not Found');
          }
        });

        const req = httpMock.expectOne(baseUrlOrderItem + "/" + itemId);
        expect(req.request.method).toBe('DELETE');
        req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
      });
});
