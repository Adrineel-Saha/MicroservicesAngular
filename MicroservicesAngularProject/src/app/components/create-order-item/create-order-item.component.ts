import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OrderItem } from 'src/app/models/order-item';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-create-order-item',
  templateUrl: './create-order-item.component.html',
  styleUrls: ['./create-order-item.component.css']
})
export class CreateOrderItemComponent implements OnInit {
  submitted=false;
  orderItem:OrderItem=new OrderItem();

  orderItemForm!: FormGroup;
  
  productIdControl!: FormControl;
  quantityControl!: FormControl;
  orderIdControl!: FormControl;

  constructor(private orderItemService:OrderService){}

  ngOnInit(){
    this.submitted=false;
    this.orderItem=new OrderItem();

    this.productIdControl=new FormControl('',[Validators.required, Validators.min(1)]);
    this.quantityControl=new FormControl('',[Validators.required, Validators.min(1)]);
    this.orderIdControl=new FormControl('',[Validators.required, Validators.min(1)]);

    this.orderItemForm=new FormGroup({
      productId: this.productIdControl,
      quantity: this.quantityControl,
      orderId: this.orderIdControl
    });
  }

  onSubmit(){
    this.orderItem=this.orderItemForm.value;

    this.orderItemService.addItem(this.orderItem).subscribe(
      data=>{
        console.log(data);
        this.submitted=true;
        this.orderItemForm.reset();
    },error=>{
      console.log(error);
    })    
  }
}
