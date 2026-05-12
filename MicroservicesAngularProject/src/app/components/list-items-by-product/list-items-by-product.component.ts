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
  isProductIdAbsent=false;

  productIdForm!: FormGroup;
  productIdControl!: FormControl;
  
  constructor(private orderService:OrderService) {}

  ngOnInit() {
    this.submitted=false;
    this.isProductIdAbsent=false;

    this.productIdControl=new FormControl('',[Validators.required, Validators.min(1)]);

    this.productIdForm=new FormGroup({
      productId: this.productIdControl
    });
  };

  onSubmit(){
    this.productId=this.productIdForm.get('productId')?.value;

    this.orderService.listItemsByProduct(this.productId)
    .subscribe( response => {
      this.orderItems = response.body ?? [];
      this.submitted=true;
      this.productIdForm.reset();
    }, error=>{
      if(error.status === 400){
        this.isProductIdAbsent=true;
        setTimeout(()=>{
          this.productIdForm.reset();
          this.isProductIdAbsent=false;
        },2000)
      }else{
        console.log(error);
      }      
    });
  }
}
