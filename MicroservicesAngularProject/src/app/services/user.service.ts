import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  private backendUserURI= "http://localhost:9191/api/users";

  // No global interceptor is registered, so attach the JWT to each request here.
  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  public createUser(user:User){
    return this.http.post<User>(this.backendUserURI,user, {headers: this.authHeaders(), observe: 'response'});
  }

  public getAllUsers(){
    return this.http.get<User[]>(this.backendUserURI, {headers: this.authHeaders(), observe: 'response'});
  }

  public getUser(userId:number){
    return this.http.get<User>(this.backendUserURI+"/"+userId, {headers: this.authHeaders(), observe: 'response'});
  }

  public updateUser(userId:number,user:User){
    return this.http.put<User>(this.backendUserURI+"/"+userId,user, {headers: this.authHeaders(), observe: 'response'});
  }

  public deleteUser(userId:number){
    return this.http.delete<string>(this.backendUserURI+"/"+userId, {headers: this.authHeaders(), responseType: 'text' as 'json', observe: 'response'});
  }

}
