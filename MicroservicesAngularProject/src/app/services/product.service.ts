import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  private backendProductURI= "http://localhost:9191/api/products";

  // No global interceptor is registered, so attach the JWT to each request here.
  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  public createProduct(product:Product){
    return this.http.post<Product>(this.backendProductURI,product, {headers: this.authHeaders(), observe: 'response'});
  }

  public getAllProducts(){
    return this.http.get<Product[]>(this.backendProductURI, {headers: this.authHeaders(), observe: 'response'});
  }

  public getProduct(productId:number){
    return this.http.get<Product>(this.backendProductURI+"/id/"+productId, {headers: this.authHeaders(), observe: 'response'});
  }

  public getProductsByName(name:string){
    return this.http.get<Product[]>(this.backendProductURI+"/name/"+name, {headers: this.authHeaders(), observe: 'response'});
  }

  public updateProduct(productId:number,product:Product){
    return this.http.put<Product>(this.backendProductURI+"/"+productId,product, {headers: this.authHeaders(), observe: 'response'});
  }

  public deleteProduct(productId:number){
    return this.http.delete<string>(this.backendProductURI+"/"+productId, {headers: this.authHeaders(), responseType: 'text' as 'json', observe: 'response'});
  }
}
