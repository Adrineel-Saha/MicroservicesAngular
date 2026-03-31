import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit{
  submitted=false;

  userForm!: FormGroup;
  userNameControl!: FormControl;
  emailControl!: FormControl;

  constructor(){}

  ngOnInit(){
    this.submitted=false;

    this.userNameControl=new FormControl('',[Validators.required,Validators.minLength(3),Validators.maxLength(50)]);
    this.emailControl=new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]);

    this.userForm=new FormGroup({
      userName: this.userNameControl,
      email: this.emailControl
    });
  }

  onSubmit(){
      // console.log("Submitted"+this.submitted);
      this.submitted=true;
      // console.log("Submitted"+this.submitted);
      // alert("Form Submitted");
  }
}
