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
    return this.http.post<Order>(this.backendOrderURI,order);
  }

  public getOrder(orderId:number){
    return this.http.get<Order>(this.backendOrderURI+"/"+orderId);
  }

  public listOrders(){
    return this.http.get<Order[]>(this.backendOrderURI);
  }

  public listOrdersByUser(userId:number){
    return this.http.get<Order[]>(this.backendOrderURI+"/"+userId);
  }

  public updateOrderStatus(orderId:number,status:string){
    return this.http.put<Order>(this.backendOrderURI+"/"+orderId+"/status/"+status,null);
  }

  public deleteOrder(orderId:number){
    return this.http.delete<string>(this.backendOrderURI+"/"+orderId,{responseType:'text' as 'json'});
  }

  public addItem(orderItem:OrderItem){
    return this.http.post<OrderItem>(this.backendOrderItemURI,orderItem);
  }

  public getItem(itemId:number){
    return this.http.get<OrderItem>(this.backendOrderItemURI+"/"+itemId);
  }

  public listItems(){
    return this.http.get<OrderItem[]>(this.backendOrderItemURI);
  }

  public listItemsByProduct(productId:number){
    return this.http.get<OrderItem[]>(this.backendOrderItemURI+"/"+productId);
  }

  public listItemsByOrder(orderId:number){
    return this.http.get<OrderItem[]>(this.backendOrderItemURI+"/"+orderId);
  }

  public updateItem(itemId:number,orderItem:OrderItem){
      return this.http.put<OrderItem>(this.backendOrderItemURI+"/"+itemId,orderItem);
  }

  public deleteItem(itemId:number){
    return this.http.delete<string>(this.backendOrderItemURI+"/"+itemId,{responseType:'text' as 'json'});
  }

}

