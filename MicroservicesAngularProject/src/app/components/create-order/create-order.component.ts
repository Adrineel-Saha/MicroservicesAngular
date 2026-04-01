import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css']
})
export class CreateOrderComponent implements OnInit{
  submitted=false;
  order:Order=new Order();

  orderForm!: FormGroup;
  
  userIdControl!: FormControl;
  statusControl!: FormControl;

  constructor(private orderService:OrderService){}

  ngOnInit(){
    this.submitted=false;
    this.order=new Order();

    this.userIdControl=new FormControl('',[Validators.required, Validators.min(1)]);
    this.statusControl=new FormControl('',[Validators.required, Validators.pattern(/^(CREATED|PAID|SHIPPED|CANCELLED)$/)]);

    this.orderForm=new FormGroup({
      userId: this.userIdControl,
      status: this.statusControl
    });
  }

  onSubmit(){
    this.order=this.orderForm.value;

    this.orderService.createOrder(this.order).subscribe(
      data=>{
        console.log(data);
        this.submitted=true;
        this.orderForm.reset();
    },error=>{
      console.log(error);
    })       
  }
}
