import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-order-item',
  templateUrl: './create-order-item.component.html',
  styleUrls: ['./create-order-item.component.css']
})
export class CreateOrderItemComponent implements OnInit {
 submitted=false;

  orderItemForm!: FormGroup;
  
  productIdControl!: FormControl;
  quantityControl!: FormControl;
  orderIdControl!: FormControl;

  constructor(){}

  ngOnInit(){
    this.submitted=false;

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
      // console.log("Submitted"+this.submitted);
      this.submitted=true;
      // console.log("Submitted"+this.submitted);
      // alert("Form Submitted");
  }
}
