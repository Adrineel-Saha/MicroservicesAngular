import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit{
  submitted=false;
  user:User=new User();

  userForm!: FormGroup;
  userNameControl!: FormControl;
  emailControl!: FormControl;

  constructor(private userService:UserService){}

  ngOnInit(){
    this.submitted=false;
    this.user=new User();

    this.userNameControl=new FormControl('',[Validators.required,Validators.minLength(3),Validators.maxLength(50)]);
    this.emailControl=new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]);

    this.userForm=new FormGroup({
      userName: this.userNameControl,
      email: this.emailControl
    });
  }

  onSubmit(){
      this.user=this.userForm.value;

      this.userService.createUser(this.user).subscribe(
        response=>{
          console.log(response.body);
          this.submitted=true;
          this.userForm.reset();
      },error=>{
        console.log(error);
      })    
  }
}
