import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../models/order';
import { OrderItem } from '../models/order-item';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  private backendOrderURI= "http://localhost:9191/api/orders";
  private backendOrderItemURI="http://localhost:9191/api/orders/items";

  public createOrder(order:Order){
    return this.http.post<Order>(this.backendOrderURI,order, {observe: 'response'});
  }

  public getOrder(orderId:number){
    return this.http.get<Order>(this.backendOrderURI+"/"+orderId, {observe: 'response'});
  }

  public listOrders(){
    return this.http.get<Order[]>(this.backendOrderURI, {observe: 'response'});
  }

  public listOrdersByUser(userId:number){
    return this.http.get<Order[]>(this.backendOrderURI+"/user/"+userId, {observe: 'response'});
  }

  public updateOrderStatus(orderId:number,status:string){
    return this.http.put<Order>(this.backendOrderURI+"/"+orderId+"/status/"+status,null, {observe: 'response'});
  }

  public deleteOrder(orderId:number){
    return this.http.delete<string>(this.backendOrderURI+"/"+orderId,{responseType:'text' as 'json', observe: 'response'});
  }

  public addItem(orderItem:OrderItem){
    return this.http.post<OrderItem>(this.backendOrderItemURI,orderItem, {observe: 'response'});
  }

  public getItem(itemId:number){
    return this.http.get<OrderItem>(this.backendOrderItemURI+"/"+itemId, {observe: 'response'});
  }

  public listItems(){
    return this.http.get<OrderItem[]>(this.backendOrderItemURI, {observe: 'response'});
  }

  public listItemsByProduct(productId:number){
    return this.http.get<OrderItem[]>(this.backendOrderItemURI+"/product/"+productId, {observe: 'response'});
  }

  public listItemsByOrder(orderId:number){
    return this.http.get<OrderItem[]>(this.backendOrderItemURI+"/order/"+orderId, {observe: 'response'});
  }

  public updateItem(itemId:number,orderItem:OrderItem){
      return this.http.put<OrderItem>(this.backendOrderItemURI+"/"+itemId,orderItem, {observe: 'response'});
  }

  public deleteItem(itemId:number){
    return this.http.delete<string>(this.backendOrderItemURI+"/"+itemId,{responseType:'text' as 'json', observe: 'response'});
  }
  
}

