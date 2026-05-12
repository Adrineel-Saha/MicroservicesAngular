import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  private backendUserURI= "http://localhost:9191/api/users";

  public createUser(user:User){
    return this.http.post<User>(this.backendUserURI,user, {observe: 'response'});
  }

  public getAllUsers(){
    return this.http.get<User[]>(this.backendUserURI, {observe: 'response'});
  }

  public getUser(userId:number){
    return this.http.get<User>(this.backendUserURI+"/"+userId, {observe: 'response'});
  }

  public updateUser(userId:number,user:User){
    return this.http.put<User>(this.backendUserURI+"/"+userId,user, {observe: 'response'});
  }

  public deleteUser(userId:number){
    return this.http.delete<string>(this.backendUserURI+"/"+userId, {responseType: 'text' as 'json', observe: 'response'});
  }

}
