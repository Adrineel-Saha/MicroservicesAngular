import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../models/order';
import { OrderItem } from '../models/order-item';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  private backendOrderURI= "http://localhost:9191/api/orders";
  private backendOrderItemURI="http://localhost:9191/api/orders/items";

  // No global interceptor is registered, so attach the JWT to each request here.
  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  public createOrder(order:Order){
    return this.http.post<Order>(this.backendOrderURI,order, {headers: this.authHeaders(), observe: 'response'});
  }

  public getOrder(orderId:number){
    return this.http.get<Order>(this.backendOrderURI+"/"+orderId, {headers: this.authHeaders(), observe: 'response'});
  }

  public listOrders(){
    return this.http.get<Order[]>(this.backendOrderURI, {headers: this.authHeaders(), observe: 'response'});
  }

  public listOrdersByUser(userId:number){
    return this.http.get<Order[]>(this.backendOrderURI+"/user/"+userId, {headers: this.authHeaders(), observe: 'response'});
  }

  public updateOrderStatus(orderId:number,status:string){
    return this.http.put<Order>(this.backendOrderURI+"/"+orderId+"/status/"+status,null, {headers: this.authHeaders(), observe: 'response'});
  }

  public deleteOrder(orderId:number){
    return this.http.delete<string>(this.backendOrderURI+"/"+orderId,{headers: this.authHeaders(), responseType:'text' as 'json', observe: 'response'});
  }

  public addItem(orderItem:OrderItem){
    return this.http.post<OrderItem>(this.backendOrderItemURI,orderItem, {headers: this.authHeaders(), observe: 'response'});
  }

  public getItem(itemId:number){
    return this.http.get<OrderItem>(this.backendOrderItemURI+"/"+itemId, {headers: this.authHeaders(), observe: 'response'});
  }

  public listItems(){
    return this.http.get<OrderItem[]>(this.backendOrderItemURI, {headers: this.authHeaders(), observe: 'response'});
  }

  public listItemsByProduct(productId:number){
    return this.http.get<OrderItem[]>(this.backendOrderItemURI+"/product/"+productId, {headers: this.authHeaders(), observe: 'response'});
  }

  public listItemsByOrder(orderId:number){
    return this.http.get<OrderItem[]>(this.backendOrderItemURI+"/order/"+orderId, {headers: this.authHeaders(), observe: 'response'});
  }

  public updateItem(itemId:number,orderItem:OrderItem){
      return this.http.put<OrderItem>(this.backendOrderItemURI+"/"+itemId,orderItem, {headers: this.authHeaders(), observe: 'response'});
  }

  public deleteItem(itemId:number){
    return this.http.delete<string>(this.backendOrderItemURI+"/"+itemId,{headers: this.authHeaders(), responseType:'text' as 'json', observe: 'response'});
  }

}
