import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css']
})
export class CreateOrderComponent implements OnInit{
  submitted=false;

  orderForm!: FormGroup;
  
  userIdControl!: FormControl;
  statusControl!: FormControl;

  constructor(){}

  ngOnInit(){
    this.submitted=false;

    this.userIdControl=new FormControl('',[Validators.required, Validators.min(1)]);
    this.statusControl=new FormControl('',[Validators.required, Validators.pattern(/^(CREATED|PAID|SHIPPED|CANCELLED)$/)]);

    this.orderForm=new FormGroup({
      userId: this.userIdControl,
      status: this.statusControl
    });
  }

  onSubmit(){
      // console.log("Submitted"+this.submitted);
      this.submitted=true;
      // console.log("Submitted"+this.submitted);
      // alert("Form Submitted");
  }
}
