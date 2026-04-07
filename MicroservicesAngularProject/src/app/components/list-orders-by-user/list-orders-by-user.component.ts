import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-list-orders-by-user',
  templateUrl: './list-orders-by-user.component.html',
  styleUrls: ['./list-orders-by-user.component.css']
})
export class ListOrdersByUserComponent implements OnInit{
  orders!: Order[];
  userId!: number;
  
  submitted=false;
  isUserIdAbsent=false;

  userIdForm!: FormGroup;
  userIdControl!: FormControl;
  
  constructor(private orderService:OrderService) {}

  ngOnInit() {
    this.submitted=false;
    this.isUserIdAbsent=false;

    this.userIdControl=new FormControl('',[Validators.required, Validators.min(1)]);

    this.userIdForm=new FormGroup({
      userId: this.userIdControl
    });
  };

  onSubmit(){
    // console.log("ProductName "+this.productNameForm.value);
    this.userId=this.userIdForm.get('userId')?.value;
    // console.log("ProductName "+this.productName);

    this.orderService.listOrdersByUser(this.userId)
    .subscribe( data => {
      this.orders = data;
      this.submitted=true;
      this.userIdForm.reset();
    }, error=>{
      if(error.status === 400){
        this.isUserIdAbsent=true;
        setTimeout(()=>{
          this.userIdForm.reset();
          this.isUserIdAbsent=false;
        },2000)
      }else{
        console.log(error);
      }   
    });
  }
}
