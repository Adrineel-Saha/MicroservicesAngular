import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  private backendProductURI= "http://localhost:9191/api/products";
  
  public createProduct(product:Product){
    return this.http.post<Product>(this.backendProductURI,product, {observe: 'response'});
  }

  public getAllProducts(){
    return this.http.get<Product[]>(this.backendProductURI, {observe: 'response'});
  }

  public getProduct(productId:number){
    return this.http.get<Product>(this.backendProductURI+"/id/"+productId, {observe: 'response'});
  }

  public getProductsByName(name:string){
    return this.http.get<Product[]>(this.backendProductURI+"/name/"+name, {observe: 'response'});
  }

  public updateProduct(productId:number,product:Product){
    return this.http.put<Product>(this.backendProductURI+"/"+productId,product, {observe: 'response'});
  }

  public deleteProduct(productId:number){
    return this.http.delete<string>(this.backendProductURI+"/"+productId, {responseType: 'text' as 'json', observe: 'response'});
  }
}
