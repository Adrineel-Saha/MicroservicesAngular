import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OrderItem } from 'src/app/models/order-item';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-list-items-by-product',
  templateUrl: './list-items-by-product.component.html',
  styleUrls: ['./list-items-by-product.component.css']
})
export class ListItemsByProductComponent implements OnInit{
  orderItems!: OrderItem[];
  productId!: number;
  
  submitted=false;

  productIdForm!: FormGroup;
  productIdControl!: FormControl;
  
  constructor(private orderService:OrderService) {}

  ngOnInit() {
    this.submitted=false;

    this.productIdControl=new FormControl('',[Validators.required, Validators.min(1)]);

    this.productIdForm=new FormGroup({
      productId: this.productIdControl
    });
  };

  onSubmit(){
    this.productId=this.productIdForm.get('productId')?.value;

    this.orderService.listItemsByProduct(this.productId)
    .subscribe( data => {
      this.orderItems = data;
      this.submitted=true;
    }, error=>{
      console.log(error);
    });
  }
}
